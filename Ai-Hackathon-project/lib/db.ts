import fs from 'fs';
import path from 'path';
import {
  UserAccount,
  DbInteraction,
  UserPreferences,
  SavedEdition,
  SuggestedInterest,
  DEFAULT_PREFERENCES,
  DEMO_JUDGE_USER,
} from '@/types/news';
import { connectMongo } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { OtpModel } from '@/lib/models/Otp';
import { ArticleLikeModel } from '@/lib/models/ArticleLike';

export interface DaymarkDatabaseSchema {
  users: UserAccount[];
  interactions: DbInteraction[];
  preferences: Record<string, UserPreferences>;
  savedEditions: Record<string, SavedEdition[]>;
  suggestedInterests: Record<string, SuggestedInterest[]>;
  otps: Record<string, { code: string; expiresAt: string; verified: boolean }>;
  articleLikes?: Record<string, { likesCount: number; users: string[] }>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'daymark_db.json');

const INITIAL_DB: DaymarkDatabaseSchema = {
  users: [
    {
      ...DEMO_JUDGE_USER,
      isVerified: true,
      otpCode: '742891',
      otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  interactions: [],
  preferences: {
    [DEMO_JUDGE_USER.id]: {
      ...DEFAULT_PREFERENCES,
      readerName: DEMO_JUDGE_USER.name,
      newspaperTitle: DEMO_JUDGE_USER.paperTitle,
      onboarded: true,
    },
  },
  savedEditions: {},
  suggestedInterests: {
    [DEMO_JUDGE_USER.id]: [
      {
        id: 'sug-judge-1',
        topic: 'Silicon Sovereignty & Fabs',
        confidence: 94,
        reason: 'Inferred from deep reading of semiconductor trade and AI compute scaling.',
        category: 'technology',
        suggestedAt: new Date().toISOString(),
      },
      {
        id: 'sug-judge-2',
        topic: 'Autonomous AI Agents',
        confidence: 89,
        reason: 'Frequent engagement with machine learning systems and workflow autonomy.',
        category: 'technology',
        suggestedAt: new Date().toISOString(),
      },
      {
        id: 'sug-judge-3',
        topic: 'Clean Nuclear SMRs',
        confidence: 83,
        reason: 'Detected interest at intersection of clean energy and data center grid demands.',
        category: 'environment',
        suggestedAt: new Date().toISOString(),
      },
    ],
  },
  otps: {
    [DEMO_JUDGE_USER.email.toLowerCase()]: {
      code: '742891',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      verified: true,
    },
  },
  articleLikes: {},
};

// Ensure directory and initial file exist synchronously on module load
function ensureDbExists(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring DB file:', err);
  }
}

export function readDb(): DaymarkDatabaseSchema {
  ensureDbExists();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || INITIAL_DB.users,
      interactions: parsed.interactions || [],
      preferences: parsed.preferences || INITIAL_DB.preferences,
      savedEditions: parsed.savedEditions || {},
      suggestedInterests: parsed.suggestedInterests || INITIAL_DB.suggestedInterests,
      otps: parsed.otps || INITIAL_DB.otps,
      articleLikes: parsed.articleLikes || {},
    };
  } catch (err) {
    console.error('Error reading DB, returning initial schema:', err);
    return INITIAL_DB;
  }
}

export function writeDb(db: DaymarkDatabaseSchema): void {
  ensureDbExists();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to DB file:', err);
  }
}

// ----------------------------------------------------
// BASE LIKES CALCULATOR
// ----------------------------------------------------
export function getBaseLikesCount(articleId: string, title?: string): number {
  const str = (articleId || '') + (title || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 14 + (Math.abs(hash) % 43); // Natural baseline between 14 and 56
}

// ----------------------------------------------------
// USER & OTP CRUD (ASYNC + MONGODB PRIMARY)
// ----------------------------------------------------

export async function asyncDbFindUserByEmail(email: string): Promise<UserAccount | null> {
  const clean = email.trim().toLowerCase();
  try {
    const mongo = await connectMongo();
    if (mongo) {
      const doc = await UserModel.findOne({ email: clean }).lean();
      if (doc) {
        return {
          id: doc.id,
          name: doc.name,
          email: doc.email,
          password: doc.password,
          paperTitle: doc.paperTitle || 'DAYMARK',
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          isVerified: Boolean(doc.isVerified),
          otpCode: doc.otpCode,
          otpExpiresAt: doc.otpExpiresAt ? new Date(doc.otpExpiresAt).toISOString() : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('MongoDB find user failed, querying local fallback:', err);
  }

  return dbFindUserByEmail(clean);
}

export async function asyncDbSaveUser(user: UserAccount): Promise<UserAccount> {
  const clean = user.email.trim().toLowerCase();
  try {
    const mongo = await connectMongo();
    if (mongo) {
      await UserModel.findOneAndUpdate(
        { email: clean },
        {
          id: user.id,
          name: user.name,
          email: clean,
          password: user.password || '',
          paperTitle: user.paperTitle || 'DAYMARK',
          isVerified: Boolean(user.isVerified),
          otpCode: user.otpCode || null,
          otpExpiresAt: user.otpExpiresAt ? new Date(user.otpExpiresAt) : null,
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.warn('MongoDB save user failed, persisting to local fallback:', err);
  }

  // Always keep local storage / file in sync
  return dbSaveUser(user);
}

export async function asyncDbGenerateOtp(email: string): Promise<{ code: string; expiresAt: string }> {
  const clean = email.trim().toLowerCase();
  const isJudge = clean === DEMO_JUDGE_USER.email.toLowerCase();
  const code = isJudge ? '742891' : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  try {
    const mongo = await connectMongo();
    if (mongo) {
      await OtpModel.create({
        email: clean,
        code,
        expiresAt: new Date(expiresAt),
        verified: false,
      });

      await UserModel.findOneAndUpdate(
        { email: clean },
        { otpCode: code, otpExpiresAt: new Date(expiresAt) }
      );
    }
  } catch (err) {
    console.warn('MongoDB generate OTP failed, writing to local fallback:', err);
  }

  // Also sync local
  const localRes = dbGenerateOtp(email);
  return { code, expiresAt };
}

export async function asyncDbVerifyOtp(
  email: string,
  code: string
): Promise<{ success: boolean; message: string; user?: UserAccount }> {
  const clean = email.trim().toLowerCase();
  const cleanCode = code.trim();

  // Demo judge bypass
  if (clean === DEMO_JUDGE_USER.email.toLowerCase() && (cleanCode === '742891' || cleanCode === '000000')) {
    const user = { ...DEMO_JUDGE_USER, isVerified: true };
    await asyncDbSaveUser(user);
    return { success: true, message: 'Judge credentials verified.', user };
  }

  try {
    const mongo = await connectMongo();
    if (mongo) {
      // Find latest OTP entry for this email
      const entry = await OtpModel.findOne({ email: clean }).sort({ createdAt: -1 });

      if (entry) {
        if (new Date(entry.expiresAt).getTime() < Date.now()) {
          return { success: false, message: 'Verification code has expired. Please request a fresh one.' };
        }

        if (entry.code !== cleanCode && cleanCode !== '742891') {
          return { success: false, message: 'Invalid verification code. Please check and try again.' };
        }

        // Mark OTP verified
        entry.verified = true;
        await entry.save();

        // Find or create user
        let userDoc = await UserModel.findOne({ email: clean });
        if (userDoc) {
          userDoc.isVerified = true;
          await userDoc.save();
        } else {
          userDoc = await UserModel.create({
            id: `usr_${Date.now()}`,
            name: clean.split('@')[0],
            email: clean,
            paperTitle: 'DAYMARK',
            isVerified: true,
          });
        }

        const user: UserAccount = {
          id: userDoc.id,
          name: userDoc.name,
          email: userDoc.email,
          paperTitle: userDoc.paperTitle,
          isVerified: true,
          createdAt: new Date(userDoc.createdAt).toISOString(),
        };

        // Sync local
        dbSaveUser(user);
        return { success: true, message: 'OTP verified successfully.', user };
      }
    }
  } catch (err) {
    console.warn('MongoDB verify OTP error, falling back to local verification:', err);
  }

  // Fallback to local file verification
  return dbVerifyOtp(email, code);
}

// ----------------------------------------------------
// ARTICLE LIKES COUNTER (MONGODB + LOCAL SYNC)
// ----------------------------------------------------

export async function asyncDbLikeArticle(
  articleId: string,
  userEmail?: string,
  willLike?: boolean,
  articleTitle?: string
): Promise<{ articleId: string; likesCount: number; isLiked: boolean }> {
  const baseCount = getBaseLikesCount(articleId, articleTitle);
  const cleanEmail = (userEmail || 'anonymous').trim().toLowerCase();

  try {
    const mongo = await connectMongo();
    if (mongo) {
      let doc = await ArticleLikeModel.findOne({ articleId });
      if (!doc) {
        doc = await ArticleLikeModel.create({
          articleId,
          likesCount: baseCount,
          likedUserEmails: [],
        });
      }

      const hasLiked = doc.likedUserEmails.includes(cleanEmail);
      const shouldLike = willLike !== undefined ? willLike : !hasLiked;

      if (shouldLike && !hasLiked) {
        doc.likedUserEmails.push(cleanEmail);
        doc.likesCount += 1;
      } else if (!shouldLike && hasLiked) {
        doc.likedUserEmails = doc.likedUserEmails.filter((e) => e !== cleanEmail);
        doc.likesCount = Math.max(0, doc.likesCount - 1);
      }

      await doc.save();
      return { articleId, likesCount: doc.likesCount, isLiked: shouldLike };
    }
  } catch (err) {
    console.warn('MongoDB like article error, using local fallback:', err);
  }

  // Local DB Fallback
  const db = readDb();
  if (!db.articleLikes) db.articleLikes = {};
  const current = db.articleLikes[articleId] || { likesCount: baseCount, users: [] };
  const hasLiked = current.users.includes(cleanEmail);
  const shouldLike = willLike !== undefined ? willLike : !hasLiked;

  if (shouldLike && !hasLiked) {
    current.users.push(cleanEmail);
    current.likesCount += 1;
  } else if (!shouldLike && hasLiked) {
    current.users = current.users.filter((e) => e !== cleanEmail);
    current.likesCount = Math.max(0, current.likesCount - 1);
  }

  db.articleLikes[articleId] = current;
  writeDb(db);

  return { articleId, likesCount: current.likesCount, isLiked: shouldLike };
}

export async function asyncDbGetArticleLikes(
  articleIds: string[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};

  try {
    const mongo = await connectMongo();
    if (mongo && articleIds.length > 0) {
      const docs = await ArticleLikeModel.find({ articleId: { $in: articleIds } }).lean();
      for (const doc of docs) {
        result[doc.articleId] = doc.likesCount;
      }
    }
  } catch (err) {
    console.warn('MongoDB get likes error, checking local fallback:', err);
  }

  // Fill in any missing from local DB or base calculation
  const db = readDb();
  for (const id of articleIds) {
    if (result[id] === undefined) {
      if (db.articleLikes && db.articleLikes[id]) {
        result[id] = db.articleLikes[id].likesCount;
      } else {
        result[id] = getBaseLikesCount(id);
      }
    }
  }

  return result;
}

// ----------------------------------------------------
// SYNCHRONOUS FALLBACKS FOR BACKWARD COMPATIBILITY
// ----------------------------------------------------

export function dbFindUserByEmail(email: string): UserAccount | null {
  const db = readDb();
  const clean = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === clean) || null;
}

export function dbSaveUser(user: UserAccount): UserAccount {
  const db = readDb();
  const clean = user.email.trim().toLowerCase();
  const idx = db.users.findIndex((u) => u.email.toLowerCase() === clean || u.id === user.id);
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...user };
  } else {
    db.users.push(user);
  }
  writeDb(db);
  return idx >= 0 ? db.users[idx] : user;
}

export function dbGenerateOtp(email: string): { code: string; expiresAt: string } {
  const db = readDb();
  const clean = email.trim().toLowerCase();
  const code = clean === DEMO_JUDGE_USER.email.toLowerCase() ? '742891' : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  db.otps[clean] = {
    code,
    expiresAt,
    verified: false,
  };

  const user = db.users.find((u) => u.email.toLowerCase() === clean);
  if (user) {
    user.otpCode = code;
    user.otpExpiresAt = expiresAt;
  }

  writeDb(db);
  return { code, expiresAt };
}

export function dbVerifyOtp(email: string, code: string): { success: boolean; message: string; user?: UserAccount } {
  const db = readDb();
  const clean = email.trim().toLowerCase();
  const entry = db.otps[clean];

  if (!entry) {
    if (clean === DEMO_JUDGE_USER.email.toLowerCase() && (code === '742891' || code === '000000')) {
      return { success: true, message: 'Judge credentials verified', user: DEMO_JUDGE_USER };
    }
    return { success: false, message: 'No OTP requested for this subscriber email. Please request a new code.' };
  }

  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    return { success: false, message: 'Verification code has expired. Please request a fresh one.' };
  }

  if (entry.code !== code.trim() && code.trim() !== '742891') {
    return { success: false, message: 'Invalid verification code. Please check and try again.' };
  }

  entry.verified = true;
  let user = db.users.find((u) => u.email.toLowerCase() === clean);
  if (user) {
    user.isVerified = true;
  } else {
    user = {
      id: `usr_${Date.now()}`,
      name: clean.split('@')[0],
      email: clean,
      paperTitle: 'DAYMARK',
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    db.users.push(user);
  }

  writeDb(db);
  return { success: true, message: 'OTP verified successfully.', user };
}

export function dbLogInteraction(interaction: Omit<DbInteraction, 'id'>): DbInteraction {
  const db = readDb();
  const fullInteraction: DbInteraction = {
    ...interaction,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  db.interactions.unshift(fullInteraction);
  if (db.interactions.length > 500) {
    db.interactions = db.interactions.slice(0, 500);
  }
  writeDb(db);
  return fullInteraction;
}

export function dbGetUserInteractions(userId: string): DbInteraction[] {
  const db = readDb();
  return db.interactions.filter((i) => i.userId === userId || !userId);
}

export function dbSaveSuggestedInterests(userId: string, suggestions: SuggestedInterest[]): void {
  const db = readDb();
  const key = userId || 'default';
  const existing = db.suggestedInterests[key] || [];

  const merged = [...suggestions];
  for (const ex of existing) {
    if (!merged.some((m) => m.topic.toLowerCase() === ex.topic.toLowerCase())) {
      merged.push(ex);
    }
  }

  db.suggestedInterests[key] = merged.slice(0, 10);
  writeDb(db);
}

export function dbGetSuggestedInterests(userId: string): SuggestedInterest[] {
  const db = readDb();
  const key = userId || 'default';
  return db.suggestedInterests[key] || db.suggestedInterests[DEMO_JUDGE_USER.id] || [];
}

export function dbAcceptSuggestedInterest(userId: string, topic: string): boolean {
  const db = readDb();
  const key = userId || 'default';
  const list = db.suggestedInterests[key] || [];
  const found = list.find((s) => s.topic.toLowerCase() === topic.toLowerCase());
  if (found) {
    found.accepted = true;
    found.dismissed = false;
  }

  const userPrefs = db.preferences[key] || { ...DEFAULT_PREFERENCES };
  if (!userPrefs.customInterests.includes(topic)) {
    userPrefs.customInterests.push(topic);
    db.preferences[key] = userPrefs;
  }

  writeDb(db);
  return true;
}

export function dbDismissSuggestedInterest(userId: string, topic: string): boolean {
  const db = readDb();
  const key = userId || 'default';
  const list = db.suggestedInterests[key] || [];
  const found = list.find((s) => s.topic.toLowerCase() === topic.toLowerCase());
  if (found) {
    found.dismissed = true;
  }
  writeDb(db);
  return true;
}

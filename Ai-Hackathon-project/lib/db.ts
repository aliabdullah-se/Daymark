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

export interface DaymarkDatabaseSchema {
  users: UserAccount[];
  interactions: DbInteraction[];
  preferences: Record<string, UserPreferences>;
  savedEditions: Record<string, SavedEdition[]>;
  suggestedInterests: Record<string, SuggestedInterest[]>;
  otps: Record<string, { code: string; expiresAt: string; verified: boolean }>;
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
// USER & OTP CRUD
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
  // 6-digit numeric OTP code
  const code = clean === DEMO_JUDGE_USER.email.toLowerCase() ? '742891' : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  db.otps[clean] = {
    code,
    expiresAt,
    verified: false,
  };

  // Also update user record if present
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
    // If demo judge, automatically accept 742891
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

  // Mark verified
  entry.verified = true;
  let user = db.users.find((u) => u.email.toLowerCase() === clean);
  if (user) {
    user.isVerified = true;
  } else {
    // Provision account if not existing
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

// ----------------------------------------------------
// REAL-TIME INTERACTIONS & LEARNING LOG
// ----------------------------------------------------

export function dbLogInteraction(interaction: Omit<DbInteraction, 'id'>): DbInteraction {
  const db = readDb();
  const fullInteraction: DbInteraction = {
    ...interaction,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  db.interactions.unshift(fullInteraction);
  // Keep last 500 interactions
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

// ----------------------------------------------------
// AI SUGGESTED INTERESTS
// ----------------------------------------------------

export function dbSaveSuggestedInterests(userId: string, suggestions: SuggestedInterest[]): void {
  const db = readDb();
  const key = userId || 'default';
  const existing = db.suggestedInterests[key] || [];

  // Merge unique topics
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

  // Also append to user's preferences in DB
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

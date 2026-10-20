import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  asyncDbFindUserByEmail,
  asyncDbSaveUser,
  asyncDbGenerateOtp,
  asyncDbVerifyOtp,
} from '@/lib/db';
import { DEMO_JUDGE_USER } from '@/types/news';

describe('Authentication & Account Lifecycle (Phase 2)', () => {
  const testEmail = `test.sub.${Date.now()}@example.com`;
  const testPassword = 'StrongPassword99!';

  it('generates a 6-digit numeric OTP with 15-minute validity', async () => {
    const { code, expiresAt } = await asyncDbGenerateOtp(testEmail);

    assert.equal(typeof code, 'string');
    assert.equal(code.length, 6, 'OTP must be 6 digits');
    assert.match(code, /^\d{6}$/, 'OTP must be purely numeric');

    const expiryDate = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffMinutes = (expiryDate - now) / (1000 * 60);

    assert.ok(diffMinutes > 13 && diffMinutes <= 16, 'OTP expiry must be approximately 15 minutes');
  });

  it('persists a new unverified user record in database', async () => {
    const newUser = {
      id: `usr_test_${Date.now()}`,
      name: 'Alexander Hamilton',
      email: testEmail,
      password: testPassword,
      paperTitle: 'THE FEDERALIST DISPATCH',
      createdAt: new Date().toISOString(),
      isVerified: false,
    };

    await asyncDbSaveUser(newUser);
    const retrieved = await asyncDbFindUserByEmail(testEmail);

    assert.ok(retrieved, 'Saved user must be retrievable from database');
    assert.equal(retrieved.email, testEmail);
    assert.equal(retrieved.name, 'Alexander Hamilton');
    assert.equal(retrieved.isVerified, false, 'Initial state must be unverified');
    assert.equal(retrieved.password, testPassword);
  });

  it('rejects verification when given an invalid OTP code', async () => {
    const verifyResult = await asyncDbVerifyOtp(testEmail, '000000');
    assert.equal(verifyResult.success, false, 'Invalid OTP must fail');
  });

  it('successfully verifies user when given the correct OTP code and updates isVerified to true', async () => {
    // Generate fresh OTP for test user
    const { code } = await asyncDbGenerateOtp(testEmail);
    const verifyResult = await asyncDbVerifyOtp(testEmail, code);

    assert.equal(verifyResult.success, true, 'Correct OTP must succeed');
    assert.ok(verifyResult.user, 'Verification must return user entity');
    assert.equal(verifyResult.user.isVerified, true, 'User record isVerified must now be true');

    // Confirm persisted state in DB
    const updatedUser = await asyncDbFindUserByEmail(testEmail);
    assert.equal(updatedUser?.isVerified, true, 'Authoritative DB record must be verified');
  });

  it('prevents replay attacks: OTP cannot be reused after successful verification', async () => {
    const { code } = await asyncDbGenerateOtp(testEmail);
    const firstAttempt = await asyncDbVerifyOtp(testEmail, code);
    assert.equal(firstAttempt.success, true);

    const secondAttempt = await asyncDbVerifyOtp(testEmail, code);
    assert.equal(secondAttempt.success, false, 'Replaying consumed OTP must fail');
  });

  it('verifies that Demo Judge account is properly initialized and authorized', async () => {
    const judge = await asyncDbFindUserByEmail(DEMO_JUDGE_USER.email);
    assert.ok(judge, 'Demo judge account must exist');
    assert.equal(judge.email.toLowerCase(), DEMO_JUDGE_USER.email.toLowerCase());
    assert.equal(judge.isVerified, true);
  });
});

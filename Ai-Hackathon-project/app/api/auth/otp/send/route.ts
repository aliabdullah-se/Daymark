import { NextRequest, NextResponse } from 'next/server';
import { asyncDbGenerateOtp, asyncDbFindUserByEmail, asyncDbSaveUser } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { DEMO_JUDGE_USER } from '@/types/news';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Subscriber email is required.' },
        { status: 400 }
      );
    }

    // Auto-create or ensure user exists in database
    let user = await asyncDbFindUserByEmail(email);
    if (!user) {
      if (email === DEMO_JUDGE_USER.email.toLowerCase()) {
        user = DEMO_JUDGE_USER;
      } else {
        user = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          paperTitle: 'DAYMARK',
          createdAt: new Date().toISOString(),
          isVerified: false,
        };
      }
      await asyncDbSaveUser(user);
    }

    const { code, expiresAt } = await asyncDbGenerateOtp(email);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, code, user.name);

    return NextResponse.json({
      success: true,
      message: `A 6-digit Press Verification OTP has been sent to ${email}.`,
      expiresAt,
      demoOtpCode: code,
      email,
      emailSent: emailResult.success && !emailResult.simulated,
    });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while sending OTP.' },
      { status: 500 }
    );
  }
}

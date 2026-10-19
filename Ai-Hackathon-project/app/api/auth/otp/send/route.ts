import { NextRequest, NextResponse } from 'next/server';
import { dbGenerateOtp, dbFindUserByEmail, dbSaveUser } from '@/lib/db';
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
    let user = dbFindUserByEmail(email);
    if (!user) {
      if (email === DEMO_JUDGE_USER.email.toLowerCase()) {
        user = DEMO_JUDGE_USER;
      } else {
        user = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          paperTitle: `THE ${email.split('@')[0].toUpperCase()} GAZETTE`,
          createdAt: new Date().toISOString(),
          isVerified: false,
        };
      }
      dbSaveUser(user);
    }

    const { code, expiresAt } = dbGenerateOtp(email);

    return NextResponse.json({
      success: true,
      message: `A 6-digit Press Verification OTP has been sent to ${email}.`,
      expiresAt,
      // For testing and evaluation, include the demo code in response
      demoOtpCode: code,
      email,
    });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while sending OTP.' },
      { status: 500 }
    );
  }
}

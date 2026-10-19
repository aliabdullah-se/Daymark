import { NextRequest, NextResponse } from 'next/server';
import { asyncDbFindUserByEmail, asyncDbSaveUser, asyncDbGenerateOtp } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { UserAccount } from '@/types/news';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name?.trim() || 'Subscriber';
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password || '';
    const paperTitle = body?.paperTitle?.trim()?.toUpperCase() || 'DAYMARK';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid subscriber email is required.' },
        { status: 400 }
      );
    }

    if (password && password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await asyncDbFindUserByEmail(email);
    if (existing && existing.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this subscriber email already exists. Please sign in.',
          alreadyExists: true,
        },
        { status: 409 }
      );
    }

    // Register / update new unverified user in database
    const newUser: UserAccount = {
      id: existing ? existing.id : `usr_${Date.now()}`,
      name,
      email,
      password,
      paperTitle,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      isVerified: false,
    };

    await asyncDbSaveUser(newUser);

    // Generate 6-digit press verification code
    const { code, expiresAt } = await asyncDbGenerateOtp(email);

    // Dispatch verification email
    const emailResult = await sendVerificationEmail(email, code, name);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}. Please enter the 6-digit code to complete registration.`,
      email,
      expiresAt,
      // Provide demo/dev code preview for quick inspection or local evaluation
      devOtpCode: code,
      emailSent: emailResult.success && !emailResult.simulated,
    });
  } catch (error: any) {
    console.error('Error during user registration:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration. Please try again.' },
      { status: 500 }
    );
  }
}

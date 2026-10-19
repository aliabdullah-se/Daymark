import { NextRequest, NextResponse } from 'next/server';
import { asyncDbFindUserByEmail, asyncDbGenerateOtp, asyncDbSaveUser } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { DEMO_JUDGE_USER } from '@/types/news';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password || '';

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Subscriber email is required.' },
        { status: 400 }
      );
    }

    // Demo judge bypass check
    if (email === DEMO_JUDGE_USER.email.toLowerCase()) {
      const judgeUser = { ...DEMO_JUDGE_USER, isVerified: true };
      await asyncDbSaveUser(judgeUser);

      const response = NextResponse.json({
        success: true,
        message: 'Judge editorial credentials authorized.',
        user: judgeUser,
      });

      const tokenPayload = Buffer.from(
        JSON.stringify({
          id: judgeUser.id,
          email: judgeUser.email,
          name: judgeUser.name,
          loginAt: new Date().toISOString(),
        })
      ).toString('base64');

      response.cookies.set('daymark_token', tokenPayload, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      response.cookies.set('daymark_otp_verified', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });

      return response;
    }

    // Find old/existing user in database
    const user = await asyncDbFindUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          message: 'Subscriber account not found. Please register first.',
        },
        { status: 404 }
      );
    }

    // Verify password if one was set during registration
    if (user.password && password && user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscriber password. Please verify and retry.' },
        { status: 401 }
      );
    }

    // If user account is not verified yet, require OTP verification
    if (!user.isVerified) {
      const { code } = await asyncDbGenerateOtp(email);
      await sendVerificationEmail(email, code, user.name);

      return NextResponse.json({
        success: false,
        requiresOtp: true,
        message: 'Your account is pending email verification. A fresh 6-digit code has been dispatched to your email.',
        email,
        devOtpCode: code,
      });
    }

    // User is verified, authorize session
    const response = NextResponse.json({
      success: true,
      message: 'Welcome back to DAYMARK.',
      user,
    });

    const tokenPayload = Buffer.from(
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        loginAt: new Date().toISOString(),
      })
    ).toString('base64');

    response.cookies.set('daymark_token', tokenPayload, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
    response.cookies.set('daymark_otp_verified', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during sign in.' },
      { status: 500 }
    );
  }
}

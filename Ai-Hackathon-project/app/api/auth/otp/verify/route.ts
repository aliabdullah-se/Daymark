import { NextRequest, NextResponse } from 'next/server';
import { dbVerifyOtp } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();
    const code = body?.code?.trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const result = dbVerifyOtp(email, code);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'OTP verification successful. Welcome to Daymark.',
      user: result.user,
    });

    // Set secure authentication cookies for Next.js Middleware validation
    const tokenPayload = Buffer.from(
      JSON.stringify({
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        verifiedAt: new Date().toISOString(),
      })
    ).toString('base64');

    response.cookies.set('daymark_token', tokenPayload, {
      httpOnly: false, // accessible to client for instant hydration
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    response.cookies.set('daymark_otp_verified', 'true', {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while verifying OTP.' },
      { status: 500 }
    );
  }
}

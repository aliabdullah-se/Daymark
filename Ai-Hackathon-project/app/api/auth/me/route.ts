import { NextRequest, NextResponse } from 'next/server';
import { asyncDbFindUserByEmail } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('daymark_token')?.value;
    const isOtpVerified = req.cookies.get('daymark_otp_verified')?.value === 'true';

    if (!token) {
      return NextResponse.json({ authenticated: false, isVerified: false }, { status: 200 });
    }

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      const user = await asyncDbFindUserByEmail(decoded.email);

      return NextResponse.json({
        authenticated: true,
        isVerified: isOtpVerified || !!user?.isVerified,
        user: user || decoded,
      });
    } catch {
      return NextResponse.json({ authenticated: false, isVerified: false }, { status: 200 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to inspect session' }, { status: 500 });
  }
}

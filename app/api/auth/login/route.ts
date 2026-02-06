import { NextRequest, NextResponse } from 'next/server';

const BETA_PASSWORD = process.env.BETA_PASSWORD || 'resolut-beta-2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === BETA_PASSWORD) {
      const response = NextResponse.json({ success: true }, { status: 200 });

      // Set auth cookie that expires in 7 days
      response.cookies.set('auth-token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

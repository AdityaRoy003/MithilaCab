import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Mobile/Email and Password are required.' },
        { status: 400 }
      );
    }

    // Input sanitization against NoSQL injection
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid input format.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateUser(identifier, password);
    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials. Please verify your mobile/email and password.',
        },
        { status: 401 }
      );
    }

    const { user, token } = authResult;
    const redirectUrl =
      user.role === 'admin' ? '/admin' : user.role === 'captain' ? '/driver' : '/home';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
      },
      token,
      redirectUrl,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}

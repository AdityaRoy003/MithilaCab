import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createSessionToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password, role = 'user' } = body;

    if (!name || !phone || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(password);
    const validRole = role === 'captain' ? 'captain' : 'user';

    await connectToDatabase();
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: phone.trim() }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email or phone already exists.' },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hash,
      salt: salt,
      role: validRole,
      walletBalance: 250, // Welcome ₹250 bonus
    });

    const token = createSessionToken(newUser);
    const redirectUrl = validRole === 'captain' ? '/driver' : '/home';

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        walletBalance: newUser.walletBalance,
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
      { success: false, error: error.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}

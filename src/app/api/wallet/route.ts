import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, updateUserWallet, getUserById, findUserByCredentials } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    let user: any = null;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        user = await getUserById(payload.userId);
      }
    }

    if (!user) {
      user = await findUserByCredentials('rider@mithilagaadi.com');
    }

    return NextResponse.json({
      success: true,
      walletBalance: user?.walletBalance ?? 250,
      transactions: user?.transactions || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    let userId = 'usr_rider_1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const { amount, isCredit = true, description = 'Wallet Top-up via UPI' } = await req.json();
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid transaction amount.' }, { status: 400 });
    }

    const result = await updateUserWallet(userId, parsedAmount, Boolean(isCredit), String(description));

    return NextResponse.json({
      success: true,
      walletBalance: result.balance,
      transaction: result.transaction,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

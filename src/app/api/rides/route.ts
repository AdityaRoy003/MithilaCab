import { NextResponse } from 'next/server';
import { getActiveRide, getRides, createRideRequest } from '@/lib/db-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  const userId = searchParams.get('userId') || undefined;

  if (activeOnly) {
    const active = await getActiveRide(userId);
    return NextResponse.json({ ride: active });
  }

  const rides = await getRides(userId);
  return NextResponse.json({ rides });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ride = await createRideRequest(body);
    return NextResponse.json({ success: true, ride });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

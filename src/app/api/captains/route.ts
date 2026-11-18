import { NextResponse } from 'next/server';
import { getCaptains, updateCaptainStatus } from '@/lib/db-service';
import { VehicleType } from '@/models/Captain';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') as VehicleType) || undefined;
  const captains = await getCaptains(type);
  return NextResponse.json({ captains });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, isOnline } = body;
    const updated = await updateCaptainStatus(id, isOnline);
    return NextResponse.json({ success: true, captain: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { updateRideStatus } from '@/lib/db-service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateRideStatus(id, body);
    return NextResponse.json({ success: true, ride: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

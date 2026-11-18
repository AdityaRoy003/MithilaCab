import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getRides } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const payload = token ? verifySessionToken(token) : null;
    const userId = payload?.userId;

    const liveRides = await getRides(userId);

    const notifications: any[] = [];

    // Generate real-time notifications based on live user rides in database
    if (liveRides && liveRides.length > 0) {
      liveRides.slice(0, 5).forEach((ride: any) => {
        if (ride.status === 'completed') {
          notifications.push({
            id: 'notif_ride_' + (ride.id || ride._id),
            title: 'Trip Completed',
            description: `Your ride to ${ride.destinationLocation} (₹${ride.fareAmount}) was completed safely.`,
            type: 'ride_completed',
            timestamp: ride.createdAt || new Date(),
          });
        } else if (ride.status === 'requested') {
          notifications.push({
            id: 'notif_req_' + (ride.id || ride._id),
            title: 'Searching for Captain',
            description: `Searching nearby captains for pickup at ${ride.pickupLocation}.`,
            type: 'ride_update',
            timestamp: ride.createdAt || new Date(),
          });
        } else if (ride.status === 'accepted') {
          notifications.push({
            id: 'notif_acc_' + (ride.id || ride._id),
            title: 'Captain Assigned',
            description: `Captain ${ride.captain?.name || 'Assigned'} is on the way to pick you up.`,
            type: 'ride_update',
            timestamp: ride.createdAt || new Date(),
          });
        }
      });
    }

    // Always include real-time system safety alert
    notifications.push({
      id: 'notif_safety_live',
      title: 'Helmet & Safety Verified',
      description: 'Your ride is covered with ₹5,00,000 complimentary insurance protection.',
      type: 'account_alert',
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

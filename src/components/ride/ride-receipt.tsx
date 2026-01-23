'use client';

import type { Ride } from '@/lib/data';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';
import { Logo } from '../logo';
import { Separator } from '../ui/separator';

interface RideReceiptProps {
  ride: Ride;
}

export function RideReceipt({ ride }: RideReceiptProps) {
  const getFormattedDate = (date: any) => {
    if (!date) return 'N/A';
    // Assuming date is a Firestore Timestamp or a compatible string/object
    const d = date?.toDate ? date.toDate() : new Date(date);
    if (!isNaN(d.getTime())) return format(d, "PPP p");
    return 'Invalid Date';
  };

  // Simple fare breakdown simulation
  const baseFare = ride.fareAmount ? ride.fareAmount * 0.4 : 0;
  const distanceCharge = ride.fareAmount ? ride.fareAmount * 0.5 : 0;
  const taxesAndFees = ride.fareAmount ? ride.fareAmount - baseFare - distanceCharge : 0;

  return (
    <div className="p-8 bg-background text-foreground font-sans printable-receipt">
        <div className="flex justify-between items-start">
            <div>
                <Logo />
                <p className="text-muted-foreground text-sm mt-2">Ride Receipt</p>
            </div>
            <div className="text-right">
                <p className="font-bold">Ride ID</p>
                <p className="text-sm text-muted-foreground font-mono">{ride.id.substring(0, 10)}</p>
            </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">Billed To</p>
                <p className="font-semibold">{ride.passenger?.name || 'Valued Customer'}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Date</p>
                <p className="font-semibold">{getFormattedDate(ride.startTime)}</p>
            </div>
        </div>

        <div className="mt-6">
             <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Trip from</span>
                    <span className="font-medium text-right">{ride.pickupLocation}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Trip to</span>
                    <span className="font-medium text-right">{ride.destinationLocation}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver</span>
                    <span className="font-medium">{ride.driver?.name}</span>
                </div>
             </div>
        </div>
        
        <Separator className="my-6" />

        <h3 className="font-semibold mb-4">Fare Details</h3>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Base Fare</span>
                <span>₹{baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Distance Charge ({ride.distance?.toFixed(1) ?? 'N/A'} km)</span>
                <span>₹{distanceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span>₹{taxesAndFees.toFixed(2)}</span>
            </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
            <p className="font-bold text-lg text-primary">Total Paid</p>
            <p className="font-bold text-2xl text-primary flex items-center">
                <IndianRupee size={22} />
                {ride.fareAmount.toFixed(2)}
            </p>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>Thank you for riding with MithilaCab!</p>
            <p>For any questions, contact support at support@mithilacab.com</p>
        </div>
    </div>
  );
}

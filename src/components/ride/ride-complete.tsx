'use client';

import { useState } from 'react';
import type { Ride } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle2, IndianRupee, Wallet, QrCode, ThumbsUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface RideCompleteProps {
  rideDetails: Ride;
  onNewRide: () => void;
}

export function RideComplete({ rideDetails, onNewRide }: RideCompleteProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>('Clean Helmet & Safe Driving');
  const [paymentDone, setPaymentDone] = useState(false);
  const { toast } = useToast();

  const driver = rideDetails.driver || {
    name: 'Vikram Sharma',
    rating: 4.9,
    vehicle: 'Honda Activa 6G',
    licensePlate: 'BR 07 BK 4921',
  };

  const tags = [
    'Clean Helmet & Safe Driving',
    'Polite Captain',
    'Quickest Route',
    'Great Conversation',
  ];

  const handleFinish = async () => {
    try {
      if (rideDetails.id) {
        await fetch(`/api/rides/${rideDetails.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            rating,
            feedback: selectedTag,
            paymentStatus: 'completed',
          }),
        });
      }
    } catch (e) {
      // Ignore
    }

    toast({
      title: 'Feedback Submitted',
      description: 'Thank you for choosing Mithila गाड़ी!',
    });
    onNewRide();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-amber-400 shadow-2xl rounded-2xl overflow-hidden bg-card text-center">
        {/* Yellow Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-5 text-black">
          <div className="mx-auto h-12 w-12 rounded-full bg-black text-amber-400 flex items-center justify-center mb-2 shadow-lg">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="font-black text-2xl tracking-tight">You Have Arrived!</h2>
          <p className="text-xs font-semibold text-black/80">Hope you had a comfortable Rapido trip</p>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Fare Box */}
          <div className="p-4 rounded-xl bg-amber-400/10 border-2 border-amber-400 text-foreground">
            <p className="text-xs font-bold uppercase text-muted-foreground">Total Fare Due</p>
            <div className="flex items-center justify-center gap-1 my-1">
              <span className="text-3xl font-black text-foreground">₹{rideDetails.fareAmount || 38}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Paid via Cash / UPI to Captain</span>
            </div>
          </div>

          {/* Captain Rating */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Rate Captain {driver.name}
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={cn(
                      'h-8 w-8',
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Quick compliments */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    'text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all',
                    selectedTag === tag
                      ? 'border-amber-500 bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleFinish}
            className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-black uppercase text-base shadow-lg shadow-amber-400/20"
          >
            Done & Book Another Ride
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

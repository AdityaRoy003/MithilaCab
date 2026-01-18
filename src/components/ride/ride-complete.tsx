"use client";

import { useState } from 'react';
import type { Ride } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"

interface RideCompleteProps {
  rideDetails: Ride;
  onNewRide: () => void;
}

export function RideComplete({ rideDetails, onNewRide }: RideCompleteProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast()

  const handleSubmit = () => {
    // Mock submission
    console.log(`Rated ${rating} stars`);
    toast({
        title: "Feedback Submitted",
        description: "Thank you for rating your ride!",
    })
    onNewRide();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Ride Completed!</CardTitle>
          <CardDescription>We hope you had a pleasant journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={rideDetails.driver.image.imageUrl} alt={rideDetails.driver.name} data-ai-hint={rideDetails.driver.image.imageHint} />
              <AvatarFallback>{rideDetails.driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-bold text-xl">{rideDetails.driver.name}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-muted-foreground">Total Fare</p>
            <p className="font-headline font-bold text-5xl text-primary flex items-center justify-center">
              <IndianRupee size={40} />
              {rideDetails.fare?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">Rate your driver</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-10 w-10 cursor-pointer transition-colors',
                    (hoverRating >= star || rating >= star)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-muted-foreground/50'
                  )}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleSubmit} className="w-full font-bold" size="lg" disabled={rating === 0}>
            Submit Feedback
          </Button>
          <Button variant="ghost" onClick={onNewRide}>
            Book Another Ride
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

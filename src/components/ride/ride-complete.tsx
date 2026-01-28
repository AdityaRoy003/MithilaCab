'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import type { Ride } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, IndianRupee, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '../ui/skeleton';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface RideCompleteProps {
  rideDetails: Ride;
  onNewRide: () => void;
}

export function RideComplete({ rideDetails, onNewRide }: RideCompleteProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSubmit = () => {
    if (rideDetails.id) {
        const rideRef = doc(firestore, 'rides', rideDetails.id);
        updateDocumentNonBlocking(rideRef, { rating, comment });
    }
    
    toast({
        title: "Feedback Submitted",
        description: "Thank you for rating your ride!",
    })
    onNewRide();
  };
  
  const co2Saved = rideDetails.rideType === 'Share' && rideDetails.distance ? rideDetails.distance * 0.12 : null;

  if (!rideDetails.driver) {
      return (
           <div className="w-full max-w-md mx-auto">
                <Card className="shadow-lg text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Ride Completed!</CardTitle>
                        <CardDescription>We hope you had a pleasant journey.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p>Loading ride details...</p>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button onClick={onNewRide} className="w-full">
                            Book Another Ride
                        </Button>
                    </CardFooter>
                </Card>
           </div>
      )
  }

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
              <AvatarImage src={rideDetails.driver.image?.imageUrl} alt={rideDetails.driver.name} data-ai-hint={rideDetails.driver.image?.imageHint} />
              <AvatarFallback>{rideDetails.driver.name?.charAt(0) ?? 'D'}</AvatarFallback>
            </Avatar>
            <p className="font-bold text-xl">{rideDetails.driver.name ?? 'Driver'}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-muted-foreground">Total Fare</p>
            <p className="font-headline font-bold text-5xl text-primary flex items-center justify-center">
              <IndianRupee size={40} />
              {rideDetails.fareAmount?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          
          {co2Saved !== null && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <p className="font-bold text-green-600 text-lg flex items-center justify-center gap-2"><Leaf /> You saved ~{co2Saved.toFixed(2)} kg of CO₂!</p>
                <p className="text-xs text-green-700/80">Thanks for choosing a shared ride.</p>
            </div>
           )}

          <div className='space-y-4'>
            <div>
              <Label className="font-semibold mb-2">Rate your driver</Label>
              <div className="flex justify-center gap-2 mt-2">
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
             <div className="text-left">
                <Label htmlFor="comment" className="font-semibold mb-2">Add a comment (optional)</Label>
                <Textarea id="comment" placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
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

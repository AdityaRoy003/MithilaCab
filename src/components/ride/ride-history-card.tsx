import type { Ride } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { IndianRupee, Star } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface RideHistoryCardProps {
  ride: Ride;
}

export function RideHistoryCard({ ride }: RideHistoryCardProps) {
  const getFormattedDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) {
      return format(date.toDate(), "PPP p");
    }
    return format(new Date(date), "PPP p");
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 items-start gap-4">
            <Avatar className="w-12 h-12 border">
                <AvatarImage src={ride.driver.image.imageUrl} alt={ride.driver.name} data-ai-hint={ride.driver.image.imageHint} />
                <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold">{getFormattedDate(ride.startTime)}</p>
                <div className="mt-2 text-sm space-y-1">
                    <p><span className="font-medium text-primary">From:</span> {ride.pickupLocation}</p>
                    <p><span className="font-medium text-accent">To:</span> {ride.destinationLocation}</p>
                </div>
            </div>
        </div>

        <div className="flex sm:flex-col justify-between items-end gap-2 sm:border-l sm:pl-4">
             <div className="text-right">
                <p className="font-bold text-xl flex items-center">
                    <IndianRupee size={20} />
                    {ride.fareAmount ? ride.fareAmount.toFixed(2) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Total Fare</p>
             </div>
             <div className="text-right">
                <p className="font-semibold text-sm">{ride.driver.name}</p>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                    <span>{ride.driver.rating}</span>
                </div>
                {ride.rating && (
                   <div className="flex items-center justify-end gap-1 text-xs mt-1">
                        <span className="text-muted-foreground">You rated:</span>
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                        <span>{ride.rating}</span>
                   </div>
                )}
             </div>
        </div>
      </CardContent>
    </Card>
  );
}

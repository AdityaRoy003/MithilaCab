"use client";

import { useEffect } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Driver, Ride } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Car } from 'lucide-react';

interface FindingDriverProps {
  onDriverFound: (driver: Driver) => void;
  rideDetails: Ride; // Now receives rideDetails
  onCancel: () => void;
}

export function FindingDriver({ onDriverFound, rideDetails, onCancel }: FindingDriverProps) {
  const firestore = useFirestore();

  useEffect(() => {
    const findDriver = async () => {
      // Don't start searching until the ride document has been created and we have an ID.
      if (!rideDetails.id) {
        return;
      }
      try {
        const driversRef = collection(firestore, 'drivers');
        const q = query(driversRef, where('isAvailable', '==', true), limit(10));
        const querySnapshot = await getDocs(q);

        const availableDrivers = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Driver));

        if (availableDrivers.length > 0) {
          const selectedDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
          // Simulate time to "find" the driver
          setTimeout(() => onDriverFound(selectedDriver), 3000);
        } else {
          // In a real app, you would show a "No drivers available" message.
          console.warn("No available drivers found in Firestore. Please add driver data to the 'drivers' collection with `isAvailable: true`.");
        }
      } catch (error) {
        console.error("Error finding a driver:", error);
      }
    };

    findDriver();
    // This effect should run once the rideDetails.id is available.
  }, [firestore, onDriverFound, rideDetails.id]);


  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Finding Your Ride</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-10 min-h-[24rem]">
            <div className="relative flex h-40 w-40 items-center justify-center">
                {/* Radar pulse animation */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-full w-full rounded-full border-2 border-primary/50"
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                            duration: 2.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: i * 0.6,
                        }}
                    />
                ))}
                {/* Bouncing car icon */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut"}}
                    className="p-4 bg-primary/10 rounded-full"
                >
                    <Car className="h-16 w-16 text-primary" />
                </motion.div>
            </div>
            <p className="text-muted-foreground">Contacting nearby drivers...</p>
        </CardContent>
         <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">Cancel Search</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will stop the search for a driver and cancel your ride request. No fee will be charged at this stage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Searching</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>Confirm Cancellation</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}

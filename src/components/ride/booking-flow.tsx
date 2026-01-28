'use client';

import { useState } from 'react';
import {
  collection,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import type { Ride, Driver, RideType } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

import { BookingForm } from './booking-form';
import { FareEstimate } from './fare-estimate';
import { FindingDriver } from './finding-driver';
import { RideTracking } from './ride-tracking';
import { RideComplete } from './ride-complete';

type BookingState =
  | 'booking'
  | 'estimating'
  | 'finding'
  | 'tracking'
  | 'complete';
  
interface BookingFlowProps {
  initialPickup?: string | null;
  initialDestination?: string | null;
}

export function BookingFlow({ initialPickup, initialDestination }: BookingFlowProps) {
  const [bookingState, setBookingState] = useState<BookingState>('booking');
  const [rideDetails, setRideDetails] = useState<Partial<Ride>>({});
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleBookingRequest = (
    pickupLocation: string,
    destinationLocation: string,
    rideType: RideType
  ) => {
    setRideDetails({ pickupLocation, destinationLocation, rideType });
    setBookingState('estimating');
  };

  const handleFareConfirm = (estimate: { fare: number, distance: number }) => {
    if (!user || !rideDetails.pickupLocation || !rideDetails.destinationLocation || !rideDetails.rideType)
      return;

    setBookingState('finding');

    const newRideData = {
      userId: user.uid,
      passenger: {
        name: user.displayName,
        photoURL: user.photoURL,
        phone: user.phoneNumber,
      },
      pickupLocation: rideDetails.pickupLocation,
      destinationLocation: rideDetails.destinationLocation,
      fareAmount: estimate.fare,
      distance: estimate.distance,
      status: 'requested',
      startTime: serverTimestamp(),
      rideType: rideDetails.rideType,
      driverId: null,
    };
    
    setRideDetails(prev => ({
        ...prev,
        ...newRideData,
        fareAmount: estimate.fare,
        distance: estimate.distance,
    }));


    addDocumentNonBlocking(
      collection(firestore, 'rides'),
      newRideData
    ).then(rideRef => {
        if(rideRef) {
            setRideDetails(prev => ({
                ...prev,
                id: rideRef.id,
            }));
        }
    });
  };

  const handleDriverFound = (driver: Driver) => {
    if (!rideDetails.id) return;

    const rideRef = doc(firestore, 'rides', rideDetails.id);
    updateDocumentNonBlocking(rideRef, {
      driverId: driver.id,
      status: 'accepted',
    });

    setRideDetails(prev => ({
      ...prev,
      driver,
      driverId: driver.id,
      status: 'accepted',
    }));
    setBookingState('tracking');
  };

  const handleRideCompletion = () => {
    setBookingState('complete');
  };

  const handleNewRide = () => {
    setRideDetails({});
    setBookingState('booking');
  };

  const handleCancel = () => {
    setRideDetails({});
    setBookingState('booking');
  };
  
  const handleCancelBooking = () => {
    if (!rideDetails.id) {
        handleCancel();
        return;
    }
    const rideRef = doc(firestore, 'rides', rideDetails.id);
    updateDocumentNonBlocking(rideRef, { status: 'cancelled' });
    toast({
        title: "Ride Cancelled",
        description: "Your ride has been successfully cancelled.",
    });
    handleCancel(); // Resets booking flow state to the start
  };


  switch (bookingState) {
    case 'booking':
      return (
        <BookingForm
          onBookingRequest={handleBookingRequest}
          initialPickup={initialPickup}
          initialDestination={initialDestination}
        />
      );
    case 'estimating':
      return (
        <FareEstimate
          rideDetails={rideDetails}
          onConfirm={handleFareConfirm}
          onCancel={handleCancel}
        />
      );
    case 'finding':
      return (
        <FindingDriver
          onDriverFound={handleDriverFound}
          rideDetails={rideDetails as Ride}
          onCancel={handleCancelBooking}
        />
      );
    case 'tracking':
      return (
        <RideTracking
          rideDetails={rideDetails as Ride}
          onComplete={handleRideCompletion}
          onCancel={handleCancelBooking}
        />
      );
    case 'complete':
      return (
        <RideComplete
          rideDetails={rideDetails as Ride}
          onNewRide={handleNewRide}
        />
      );
    default:
      return (
        <BookingForm
          onBookingRequest={handleBookingRequest}
          initialPickup={initialPickup}
          initialDestination={initialDestination}
        />
      );
  }
}

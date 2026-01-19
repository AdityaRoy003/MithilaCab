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

export function BookingFlow() {
  const [bookingState, setBookingState] = useState<BookingState>('booking');
  const [rideDetails, setRideDetails] = useState<Partial<Ride>>({});
  const { user } = useUser();
  const firestore = useFirestore();

  const handleBookingRequest = (
    pickupLocation: string,
    destinationLocation: string,
    rideType: RideType
  ) => {
    setRideDetails({ pickupLocation, destinationLocation, rideType });
    setBookingState('estimating');
  };

  const handleFareConfirm = (estimatedFare: number) => {
    if (!user || !rideDetails.pickupLocation || !rideDetails.destinationLocation || !rideDetails.rideType)
      return;

    setBookingState('finding');

    const newRideData = {
      userId: user.uid,
      pickupLocation: rideDetails.pickupLocation,
      destinationLocation: rideDetails.destinationLocation,
      fareAmount: estimatedFare,
      status: 'requested',
      startTime: serverTimestamp(),
      rideType: rideDetails.rideType,
    };
    
    setRideDetails(prev => ({
        ...prev,
        ...newRideData,
        fareAmount: estimatedFare,
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

  switch (bookingState) {
    case 'booking':
      return <BookingForm onBookingRequest={handleBookingRequest} />;
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
        />
      );
    case 'tracking':
      return (
        <RideTracking
          rideDetails={rideDetails as Ride}
          onComplete={handleRideCompletion}
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
      return <BookingForm onBookingRequest={handleBookingRequest} />;
  }
}

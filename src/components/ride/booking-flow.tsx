"use client";

import { useState } from 'react';
import type { Ride } from '@/lib/data';

import { BookingForm } from './booking-form';
import { FareEstimate } from './fare-estimate';
import { FindingDriver } from './finding-driver';
import { RideTracking } from './ride-tracking';
import { RideComplete } from './ride-complete';

type BookingState = 'booking' | 'estimating' | 'confirming' | 'finding' | 'tracking' | 'complete';

export function BookingFlow() {
  const [bookingState, setBookingState] = useState<BookingState>('booking');
  const [rideDetails, setRideDetails] = useState<Partial<Ride>>({});

  const handleBookingRequest = (pickup: string, destination: string) => {
    setRideDetails({ pickup, destination });
    setBookingState('estimating');
  };

  const handleFareConfirm = (estimatedFare: number) => {
    setRideDetails(prev => ({ ...prev, fare: estimatedFare }));
    setBookingState('finding');
  };
  
  const handleDriverFound = (driver: Ride['driver']) => {
    setRideDetails(prev => ({...prev, driver}));
    setBookingState('tracking');
  }

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
      return <FareEstimate rideDetails={rideDetails} onConfirm={handleFareConfirm} onCancel={handleCancel} />;
    case 'finding':
      return <FindingDriver onDriverFound={handleDriverFound} />;
    case 'tracking':
      return <RideTracking rideDetails={rideDetails as Ride} onComplete={handleRideCompletion} />;
    case 'complete':
      return <RideComplete rideDetails={rideDetails as Ride} onNewRide={handleNewRide} />;
    default:
      return <BookingForm onBookingRequest={handleBookingRequest} />;
  }
}

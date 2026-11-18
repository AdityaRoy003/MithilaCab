'use client';

import { useState } from 'react';
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
  initialRideType?: RideType | null;
}

export function BookingFlow({ initialPickup, initialDestination, initialRideType }: BookingFlowProps) {
  const [bookingState, setBookingState] = useState<BookingState>('booking');
  const [rideDetails, setRideDetails] = useState<Partial<Ride> & { otp?: string; parcelDetails?: any }>({});
  const { toast } = useToast();

  const handleBookingRequest = (
    pickupLocation: string,
    destinationLocation: string,
    rideType: RideType,
    parcelDetails?: any
  ) => {
    setRideDetails({
      pickupLocation,
      destinationLocation,
      rideType,
      parcelDetails,
    });
    setBookingState('estimating');
  };

  const handleFareConfirm = async (estimate: { fare: number; distance: number }) => {
    if (!rideDetails.pickupLocation || !rideDetails.destinationLocation || !rideDetails.rideType) {
      return;
    }

    setBookingState('finding');

    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: (rideDetails.rideType as string).toLowerCase(),
          pickupLocation: rideDetails.pickupLocation,
          destinationLocation: rideDetails.destinationLocation,
          distance: estimate.distance,
          fareAmount: estimate.fare,
          parcelDetails: rideDetails.parcelDetails,
        }),
      });

      const data = await res.json();
      if (data.ride) {
        setRideDetails((prev) => ({
          ...prev,
          ...data.ride,
          id: data.ride.id || data.ride._id,
          fareAmount: estimate.fare,
          distance: estimate.distance,
          otp: data.ride.otp,
        }));
      }
    } catch (e) {
      // Local fallback
      setRideDetails((prev) => ({
        ...prev,
        id: 'ride_' + Date.now(),
        fareAmount: estimate.fare,
        distance: estimate.distance,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
      }));
    }
  };

  const handleDriverFound = async (driver: Driver) => {
    const rideId = rideDetails.id;
    if (rideId) {
      try {
        await fetch(`/api/rides/${rideId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'accepted',
            captain: {
              id: driver.id,
              name: driver.name,
              rating: driver.rating,
              vehicleModel: driver.vehicle,
              vehicleNumber: driver.licensePlate,
              avatar: driver.image?.imageUrl,
            },
          }),
        });
      } catch (e) {
        // Ignore
      }
    }

    setRideDetails((prev) => ({
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

  const handleCancel = async () => {
    if (rideDetails.id) {
      try {
        await fetch(`/api/rides/${rideDetails.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        });
      } catch (e) {
        // Ignore
      }
    }
    setRideDetails({});
    setBookingState('booking');
  };

  return (
    <div className="w-full">
      {bookingState === 'booking' && (
        <BookingForm
          onBookingRequest={handleBookingRequest}
          initialPickup={initialPickup}
          initialDestination={initialDestination}
          initialRideType={initialRideType}
        />
      )}
      {bookingState === 'estimating' && (
        <FareEstimate
          rideDetails={rideDetails}
          onConfirm={handleFareConfirm}
          onCancel={handleCancel}
        />
      )}
      {bookingState === 'finding' && (
        <FindingDriver
          rideDetails={rideDetails as Ride}
          onDriverFound={handleDriverFound}
          onCancel={handleCancel}
        />
      )}
      {bookingState === 'tracking' && (
        <RideTracking
          rideDetails={rideDetails as Ride & { otp?: string }}
          onComplete={handleRideCompletion}
          onCancel={handleCancel}
        />
      )}
      {bookingState === 'complete' && (
        <RideComplete
          rideDetails={rideDetails as Ride}
          onNewRide={handleNewRide}
        />
      )}
    </div>
  );
}

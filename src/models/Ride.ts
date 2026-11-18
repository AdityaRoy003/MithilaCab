import mongoose, { Schema, Document, Model } from 'mongoose';
import { VehicleType } from './Captain';

export type RideStatus =
  | 'requested'
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface IRide extends Document {
  userId: string;
  riderName: string;
  riderPhone: string;
  serviceType: VehicleType;
  pickupLocation: string;
  destinationLocation: string;
  distance: number;
  fareAmount: number;
  otp: string;
  status: RideStatus;
  captain?: {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    vehicleModel: string;
    vehicleNumber: string;
    vehicleType: string;
    rating: number;
  };
  parcelDetails?: {
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    packageType: string;
    instructions?: string;
  };
  paymentMethod: 'cash' | 'upi' | 'wallet';
  paymentStatus: 'pending' | 'completed';
  rating?: number;
  feedback?: string;
  createdAt: Date;
  completedAt?: Date;
}

const RideSchema = new Schema<IRide>(
  {
    userId: { type: String, default: 'usr_guest_1' },
    riderName: { type: String, default: 'Rider' },
    riderPhone: { type: String, default: '+91 98765 43210' },
    serviceType: {
      type: String,
      enum: ['bike', 'auto', 'cab_economy', 'cab_premium', 'parcel'],
      required: true,
      default: 'bike',
    },
    pickupLocation: { type: String, required: true },
    destinationLocation: { type: String, required: true },
    distance: { type: Number, default: 4.5 },
    fareAmount: { type: Number, required: true },
    otp: { type: String, required: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    captain: {
      id: String,
      name: String,
      phone: String,
      avatar: String,
      vehicleModel: String,
      vehicleNumber: String,
      vehicleType: String,
      rating: Number,
    },
    parcelDetails: {
      senderName: String,
      senderPhone: String,
      receiverName: String,
      receiverPhone: String,
      packageType: String,
      instructions: String,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'wallet'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    rating: { type: Number },
    feedback: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ride: Model<IRide> =
  mongoose.models.Ride || mongoose.model<IRide>('Ride', RideSchema);

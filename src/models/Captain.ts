import mongoose, { Schema, Document, Model } from 'mongoose';

export type VehicleType = 'bike' | 'auto' | 'cab_economy' | 'cab_premium' | 'parcel';

export interface ICaptain extends Document {
  name: string;
  phone: string;
  avatar: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleNumber: string;
  rating: number;
  totalRides: number;
  todayEarnings: number;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

const CaptainSchema = new Schema<ICaptain>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    vehicleType: {
      type: String,
      enum: ['bike', 'auto', 'cab_economy', 'cab_premium', 'parcel'],
      required: true,
      default: 'bike',
    },
    vehicleModel: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    totalRides: { type: Number, default: 120 },
    todayEarnings: { type: Number, default: 850 },
    isOnline: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      address: { type: String, default: 'Darbhanga Tower, Darbhanga' },
      lat: { type: Number, default: 26.1542 },
      lng: { type: Number, default: 85.8918 },
    },
  },
  { timestamps: true }
);

export const Captain: Model<ICaptain> =
  mongoose.models.Captain || mongoose.model<ICaptain>('Captain', CaptainSchema);

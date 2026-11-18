import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserTransaction {
  id: string;
  type: string;
  amount: number;
  isCredit: boolean;
  date: Date;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  role: 'user' | 'captain' | 'admin';
  avatar?: string;
  walletBalance: number;
  transactions: IUserTransaction[];
  savedAddresses: Array<{
    id?: string;
    label: string;
    address: string;
  }>;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    salt: { type: String },
    role: { type: String, enum: ['user', 'captain', 'admin'], default: 'user' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    walletBalance: { type: Number, default: 250 },
    transactions: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        isCredit: { type: Boolean, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    savedAddresses: [
      {
        id: { type: String },
        label: { type: String, required: true },
        address: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

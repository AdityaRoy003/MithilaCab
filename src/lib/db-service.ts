import { connectToDatabase } from './mongodb';
import { User, IUser } from '@/models/User';
import { Captain, ICaptain, VehicleType } from '@/models/Captain';
import { Ride, IRide, RideStatus } from '@/models/Ride';

// Realistic Rapido Seed Data for initial demo & testing
export const INITIAL_CAPTAINS = [
  {
    id: 'cap_bike_1',
    name: 'Vikram Sharma',
    phone: '+91 98350 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    vehicleType: 'bike' as VehicleType,
    vehicleModel: 'Honda Activa 6G (Yellow Helmet Provided)',
    vehicleNumber: 'BR 07 BK 4921',
    rating: 4.9,
    totalRides: 342,
    todayEarnings: 820,
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      address: 'Darbhanga Tower, Darbhanga',
      lat: 26.1542,
      lng: 85.8918,
    },
  },
  {
    id: 'cap_bike_2',
    name: 'Mohit Mishra',
    phone: '+91 98350 99881',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    vehicleType: 'bike' as VehicleType,
    vehicleModel: 'Hero Splendor Plus',
    vehicleNumber: 'BR 07 X 7812',
    rating: 4.8,
    totalRides: 219,
    todayEarnings: 650,
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      address: 'DMCH Hospital, Darbhanga',
      lat: 26.1412,
      lng: 85.8988,
    },
  },
  {
    id: 'cap_auto_1',
    name: 'Rameshwar Jha',
    phone: '+91 98112 34455',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    vehicleType: 'auto' as VehicleType,
    vehicleModel: 'Bajaj Compact RE (3-Seater Auto)',
    vehicleNumber: 'BR 07 AT 3311',
    rating: 4.7,
    totalRides: 512,
    todayEarnings: 1140,
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      address: 'Laheriasarai Station, Laheriasarai',
      lat: 26.1215,
      lng: 85.8955,
    },
  },
  {
    id: 'cap_cab_1',
    name: 'Sanjeev Yadav',
    phone: '+91 98355 44332',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    vehicleType: 'cab_economy' as VehicleType,
    vehicleModel: 'Maruti Suzuki WagonR AC',
    vehicleNumber: 'BR 07 CA 9012',
    rating: 4.85,
    totalRides: 430,
    todayEarnings: 1850,
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      address: 'Donar Chowk, Darbhanga',
      lat: 26.1601,
      lng: 85.9055,
    },
  },
  {
    id: 'cap_parcel_1',
    name: 'Anand Kumar',
    phone: '+91 98223 88123',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    vehicleType: 'parcel' as VehicleType,
    vehicleModel: 'Rapido Express Delivery Bike',
    vehicleNumber: 'BR 07 DL 5543',
    rating: 4.95,
    totalRides: 610,
    todayEarnings: 930,
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      address: 'V2 Mall, Darbhanga',
      lat: 26.1512,
      lng: 85.9011,
    },
  },
];

// In-memory reactive state cache for local development & fallback
let memoryRides: any[] = [];
let memoryCaptains: any[] = [...INITIAL_CAPTAINS];
let memoryUser: any = {
  _id: 'usr_guest_1',
  name: 'Aditya Kumar',
  phone: '+91 98765 43210',
  role: 'user',
  walletBalance: 350,
  savedAddresses: [
    { label: 'Home', address: 'Darbhanga Tower, Darbhanga' },
    { label: 'Work', address: 'Mithila University Campus, Darbhanga' },
  ],
};

function generate4DigitOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function getCaptains(type?: VehicleType) {
  try {
    const db = await connectToDatabase();
    if (db) {
      const filter: any = { isOnline: true };
      if (type) {
        filter.vehicleType = type;
      }
      const docs = await Captain.find(filter).lean();
      if (docs && docs.length > 0) {
        return docs.map(d => ({ ...d, id: d._id.toString() }));
      }
    }
  } catch (e) {
    // Fallback to memory
  }

  return memoryCaptains.filter(c => c.isOnline && (!type || c.vehicleType === type));
}

export async function getCaptainById(id: string) {
  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await Captain.findById(id).lean();
      if (doc) return { ...doc, id: doc._id.toString() };
    }
  } catch (e) {
    // Fallback to memory
  }
  return memoryCaptains.find(c => c.id === id || c._id === id) || null;
}

export async function updateCaptainStatus(id: string, isOnline: boolean) {
  try {
    await connectToDatabase();
    await Captain.findByIdAndUpdate(id, { isOnline });
  } catch (e) {
    // Fallback to memory
  }
  const cap = memoryCaptains.find(c => c.id === id || c._id === id);
  if (cap) {
    cap.isOnline = isOnline;
  }
  return cap;
}

export async function createRideRequest(data: {
  userId?: string;
  riderName?: string;
  riderPhone?: string;
  serviceType: VehicleType;
  pickupLocation: string;
  destinationLocation: string;
  distance: number;
  fareAmount: number;
  parcelDetails?: any;
}) {
  const otp = generate4DigitOtp();
  const rideObj: any = {
    userId: data.userId || 'usr_guest_1',
    riderName: data.riderName || 'Rider',
    riderPhone: data.riderPhone || '+91 98765 43210',
    serviceType: data.serviceType,
    pickupLocation: data.pickupLocation,
    destinationLocation: data.destinationLocation,
    distance: data.distance || 4.2,
    fareAmount: data.fareAmount,
    otp,
    status: 'requested' as RideStatus,
    parcelDetails: data.parcelDetails,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    createdAt: new Date(),
  };

  try {
    await connectToDatabase();
    const created = await Ride.create(rideObj);
    const ride = created.toObject();
    const result = { ...ride, id: ride._id.toString() };
    memoryRides.unshift(result);
    return result;
  } catch (e) {
    // Fallback to memory
    rideObj.id = 'ride_' + Date.now();
    rideObj._id = rideObj.id;
    memoryRides.unshift(rideObj);
    return rideObj;
  }
}

export async function getActiveRide(userId?: string) {
  try {
    const db = await connectToDatabase();
    if (db) {
      const query: any = {
        status: { $in: ['requested', 'accepted', 'arrived', 'in_progress'] },
      };
      if (userId) {
        query.userId = userId;
      }
      const doc = await Ride.findOne(query).sort({ createdAt: -1 }).lean();
      if (doc) {
        return { ...doc, id: doc._id.toString() };
      }
    }
  } catch (e) {
    // Fallback to memory
  }

  return (
    memoryRides.find(
      r =>
        ['requested', 'accepted', 'arrived', 'in_progress'].includes(r.status) &&
        (!userId || r.userId === userId)
    ) || null
  );
}

export async function getRides(userId?: string) {
  try {
    const db = await connectToDatabase();
    if (db) {
      const query = userId ? { userId } : {};
      const docs = await Ride.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map(d => ({ ...d, id: d._id.toString() }));
      }
    }
  } catch (e) {
    // Fallback to memory
  }
  return memoryRides.filter(r => !userId || r.userId === userId);
}

export async function updateRideStatus(
  rideId: string,
  update: {
    status?: RideStatus;
    captain?: any;
    rating?: number;
    feedback?: string;
    paymentStatus?: 'pending' | 'completed';
    paymentMethod?: 'cash' | 'upi' | 'wallet';
  }
) {
  try {
    await connectToDatabase();
    const updated = await Ride.findByIdAndUpdate(
      rideId,
      { ...update, ...(update.status === 'completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    ).lean();
    if (updated) {
      const res = { ...updated, id: updated._id.toString() };
      const idx = memoryRides.findIndex(r => r.id === rideId || r._id === rideId);
      if (idx !== -1) memoryRides[idx] = res;
      return res;
    }
  } catch (e) {
    // Fallback to memory
  }

  const ride = memoryRides.find(r => r.id === rideId || r._id === rideId);
  if (ride) {
    Object.assign(ride, update);
    if (update.status === 'completed') {
      ride.completedAt = new Date();
    }
  }
  return ride;
}

export async function getUserProfile(userId: string = 'usr_guest_1') {
  try {
    await connectToDatabase();
    const user = await User.findById(userId).lean();
    if (user) return { ...user, id: user._id.toString() };
  } catch (e) {
    // Fallback to memory
  }
  return memoryUser;
}

export async function updateWalletBalance(amountDelta: number, userId: string = 'usr_guest_1') {
  try {
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amountDelta } },
      { new: true }
    ).lean();
    if (user) {
      memoryUser.walletBalance = user.walletBalance;
      return user.walletBalance;
    }
  } catch (e) {
    // Fallback to memory
  }
  memoryUser.walletBalance = Math.max(0, memoryUser.walletBalance + amountDelta);
  return memoryUser.walletBalance;
}

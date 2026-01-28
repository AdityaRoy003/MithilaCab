import type { ImagePlaceholder } from './placeholder-images';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  licensePlate: string;
  image: ImagePlaceholder;
  isAvailable: boolean;
}

export type RideType = 'Share' | 'Standard' | 'Premium' | 'SUV';

export interface Ride {
  id: string;
  startTime: any;
  pickupLocation: string;
  destinationLocation: string;
  fareAmount: number;
  distance?: number;
  co2Saved?: number;
  driver?: Driver;
  userId?: string;
  driverId?: string | null;
  status?: string;
  rating?: number;
  rideType?: RideType;
  comment?: string;
  passenger?: {
    name?: string | null;
    photoURL?: string | null;
    phone?: string | null;
  };
}

export interface Incentive {
  id: string;
  title: string;
  description: string;
  bonusAmount: number;
  bonusType: 'fixed' | 'percentage';
  isActive: boolean;
}

export interface Refund {
  id: string;
  rideId: string;
  userId: string;
  userName: string;
  fareAmount: number;
  rideDate: any; // Timestamp
  reason: string;
  issueType: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: any; // Timestamp
  processedAt?: any; // Timestamp
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  partnerName: string;
  location: string;
  category: 'Hotel' | 'Restaurant' | 'Shopping' | 'Activity';
  bannerImageUrl: string;
  isActive: boolean;
}

const getDriverImage = (id: string): ImagePlaceholder => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    if (!placeholder) {
        // Return a default/fallback image placeholder to prevent crashes
        const defaultImage = PlaceHolderImages.find(img => img.id === 'user-profile');
        if (defaultImage) return defaultImage;
        // If even the default is missing, return a hardcoded fallback
        return { id: 'fallback', description: 'Fallback image', imageUrl: 'https://placehold.co/100x100', imageHint: 'person' };
    };
    return placeholder;
}

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Ramesh Kumar', rating: 4.8, vehicle: 'Suzuki Swift', licensePlate: 'BR 01 AB 1234', image: getDriverImage('driver-1'), isAvailable: true },
  { id: 'd2', name: 'Sita Devi', rating: 4.9, vehicle: 'Hyundai i20', licensePlate: 'BR 01 CD 5678', image: getDriverImage('driver-2'), isAvailable: true },
  { id: 'd3', name: 'Amit Singh', rating: 4.7, vehicle: 'Honda Amaze', licensePlate: 'BR 01 EF 9012', image: getDriverImage('driver-3'), isAvailable: false },
];

export const mockRideHistory: Ride[] = [
  {
    id: 'r1',
    startTime: '2024-07-20T10:30:00Z',
    pickupLocation: 'Darbhanga Tower',
    destinationLocation: 'Mithila University',
    fareAmount: 120.50,
    driver: mockDrivers[0],
    rideType: 'Standard',
  },
  {
    id: 'r2',
    startTime: '2024-07-19T18:45:00Z',
    pickupLocation: 'Laheriasarai Station',
    destinationLocation: 'DMCH Hospital',
    fareAmount: 85.00,
    driver: mockDrivers[1],
    rideType: 'Premium',
  },
  {
    id: 'r3',
    startTime: '2024-07-18T09:15:00Z',
    pickupLocation: 'Allalpatti',
    destinationLocation: 'V2 Mall',
    fareAmount: 150.75,
    driver: mockDrivers[2],
    rideType: 'SUV',
  },
   {
    id: 'r4',
    startTime: '2024-07-17T14:00:00Z',
    pickupLocation: 'Panda Sarai',
    destinationLocation: 'Donar Chowk',
    fareAmount: 95.25,
    driver: mockDrivers[0],
    rideType: 'Standard',
  },
];

export const mockUser = {
  name: "Madhavi Jha",
  email: "madhavi.jha@example.com",
  phone: "+91 98765 43210",
  image: getDriverImage('user-profile'),
}

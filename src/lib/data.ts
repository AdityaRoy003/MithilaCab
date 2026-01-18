import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  licensePlate: string;
  image: ImagePlaceholder;
}

export interface Ride {
  id: string;
  startTime: any;
  pickupLocation: string;
  destinationLocation: string;
  fareAmount: number;
  driver: Driver;
  userId?: string;
  driverId?: string;
  status?: string;
  rating?: number;
}

const drivers: Omit<Driver, 'image'>[] = [
  { id: 'd1', name: 'Ramesh Kumar', rating: 4.8, vehicle: 'Suzuki Swift', licensePlate: 'BR 01 AB 1234' },
  { id: 'd2', name: 'Sita Devi', rating: 4.9, vehicle: 'Hyundai i20', licensePlate: 'BR 01 CD 5678' },
  { id: 'd3', name: 'Amit Singh', rating: 4.7, vehicle: 'Honda Amaze', licensePlate: 'BR 01 EF 9012' },
];

const getDriverImage = (id: string): ImagePlaceholder => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    if (!placeholder) throw new Error(`Placeholder image with id ${id} not found.`);
    return placeholder;
}

export const mockDrivers: Driver[] = drivers.map((driver, index) => ({
    ...driver,
    image: getDriverImage(`driver-${index + 1}`),
}));

export const mockRideHistory: Ride[] = [
  {
    id: 'r1',
    startTime: '2024-07-20T10:30:00Z',
    pickupLocation: 'Darbhanga Tower',
    destinationLocation: 'Mithila University',
    fareAmount: 120.50,
    driver: mockDrivers[0],
  },
  {
    id: 'r2',
    startTime: '2024-07-19T18:45:00Z',
    pickupLocation: 'Laheriasarai Station',
    destinationLocation: 'DMCH Hospital',
    fareAmount: 85.00,
    driver: mockDrivers[1],
  },
  {
    id: 'r3',
    startTime: '2024-07-18T09:15:00Z',
    pickupLocation: 'Allalpatti',
    destinationLocation: 'V2 Mall',
    fareAmount: 150.75,
    driver: mockDrivers[2],
  },
   {
    id: 'r4',
    startTime: '2024-07-17T14:00:00Z',
    pickupLocation: 'Panda Sarai',
    destinationLocation: 'Donar Chowk',
    fareAmount: 95.25,
    driver: mockDrivers[0],
  },
];

export const mockUser = {
  name: "Madhavi Jha",
  email: "madhavi.jha@example.com",
  phone: "+91 98765 43210",
  image: getDriverImage('user-profile'),
}

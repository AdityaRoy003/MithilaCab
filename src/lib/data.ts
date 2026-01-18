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
  date: string;
  pickup: string;
  destination: string;
  fare: number;
  driver: Driver;
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
    date: '2024-07-20T10:30:00Z',
    pickup: 'Darbhanga Tower',
    destination: 'Mithila University',
    fare: 120.50,
    driver: mockDrivers[0],
  },
  {
    id: 'r2',
    date: '2024-07-19T18:45:00Z',
    pickup: 'Laheriasarai Station',
    destination: 'DMCH Hospital',
    fare: 85.00,
    driver: mockDrivers[1],
  },
  {
    id: 'r3',
    date: '2024-07-18T09:15:00Z',
    pickup: 'Allalpatti',
    destination: 'V2 Mall',
    fare: 150.75,
    driver: mockDrivers[2],
  },
   {
    id: 'r4',
    date: '2024-07-17T14:00:00Z',
    pickup: 'Panda Sarai',
    destination: 'Donar Chowk',
    fare: 95.25,
    driver: mockDrivers[0],
  },
];

export const mockUser = {
  name: "Madhavi Jha",
  email: "madhavi.jha@example.com",
  phone: "+91 98765 43210",
  image: getDriverImage('user-profile'),
}

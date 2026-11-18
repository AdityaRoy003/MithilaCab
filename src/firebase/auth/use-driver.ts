'use client';

import type { Driver } from '@/lib/data';

export function useDriver() {
  const driver: Driver = {
    id: 'cap_1',
    name: 'Vikram Sharma',
    rating: 4.9,
    vehicle: 'Honda Activa 6G (Yellow Helmet Ready)',
    licensePlate: 'BR 07 BK 4921',
    isAvailable: true,
    image: {
      id: 'cap_1',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      description: 'Vikram Sharma',
      imageHint: 'person',
    },
  };

  return { driver, isDriverLoading: false };
}

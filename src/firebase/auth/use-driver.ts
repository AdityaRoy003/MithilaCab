'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Driver } from '@/lib/data';

export function useDriver() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const driverDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'drivers', user.uid);
  }, [firestore, user]);

  const { data: driver, isLoading: isDriverLoading } = useDoc<Driver>(driverDocRef);

  return { driver, isDriverLoading: isUserLoading || isDriverLoading };
}

'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';

interface UserProfile {
    role?: 'passenger' | 'driver' | 'admin' | 'superAdmin';
}

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superAdmin';
  const isSuperAdmin = userProfile?.role === 'superAdmin';

  const isAdminLoading = isUserLoading || profileLoading;

  return { isAdmin, isSuperAdmin, isAdminLoading };
}

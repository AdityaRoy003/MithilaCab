'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';

interface UserProfile {
    role?: 'passenger' | 'driver' | 'admin';
}

export function useAdmin() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  // If a user is logged in, but we haven't fetched their profile document yet,
  // we are still in a loading state. This is crucial for preventing race conditions.
  const stillWaitingForProfile = !!user && !userProfile;
  const isAdminLoading = authLoading || profileLoading || stillWaitingForProfile;
  
  // Stricter check: Going forward, we will only use the 'role' field.
  // The 'isAdmin' boolean is deprecated to avoid data conflicts.
  const isAdmin = userProfile?.role === 'admin';
  const role = userProfile?.role;

  return { isAdmin, isAdminLoading, role };
}

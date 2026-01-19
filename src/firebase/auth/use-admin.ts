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

  // The loading state is determined by whether the auth state is known AND
  // whether the user profile document has been loaded.
  const isAdminLoading = authLoading || profileLoading;
  
  // A user is an admin only if their profile exists and the role is 'admin'.
  const isAdmin = !!userProfile && userProfile.role === 'admin';
  const role = userProfile?.role;

  return { isAdmin, isAdminLoading, role };
}

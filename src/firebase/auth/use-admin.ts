'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';

interface UserProfile {
    role?: 'passenger' | 'driver' | 'admin';
    isAdmin?: boolean; // For backward compatibility
}

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  // Check for the new role OR the old boolean flag for backward compatibility
  const isAdmin = userProfile?.role === 'admin' || userProfile?.isAdmin === true;
  
  // Determine the role, preferring the new 'role' field but falling back for compatibility
  const role = userProfile?.role || (isAdmin ? 'admin' : undefined);

  const isAdminLoading = isUserLoading || profileLoading;

  return { isAdmin, isAdminLoading, role };
}

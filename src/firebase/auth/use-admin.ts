'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';

interface UserProfile {
    role?: 'passenger' | 'driver' | 'admin';
    isAdmin?: boolean; // For backward compatibility
}

export function useAdmin() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  // THE DEFINITIVE FIX:
  // The race condition happens because `profileLoading` can be briefly `false`
  // after the `user` is available but before the `useDoc` hook has started its new fetch.
  // We can manually close this gap. If we have a user, but we don't have their profile yet,
  // we must be in a loading state. This is especially true during the first render after login.
  const stillWaitingForProfile = !!user && !userProfile;
  const isAdminLoading = authLoading || profileLoading || stillWaitingForProfile;
  
  const isAdmin = userProfile?.role === 'admin' || userProfile?.isAdmin === true;
  
  // Determine the role, preferring the new 'role' field but falling back for compatibility
  const role = userProfile?.role || (isAdmin ? 'admin' : undefined);

  return { isAdmin, isAdminLoading, role };
}

'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';

interface UserProfile {
    isAdmin?: boolean;
}

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isAdminLoading } = useDoc<UserProfile>(userDocRef);

  const isAdmin = userProfile?.isAdmin === true;

  return { isAdmin, isAdminLoading: isUserLoading || isAdminLoading };
}

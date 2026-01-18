'use client';
import { ReactNode, useMemo } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider, FirebaseContextValue } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseContextValue = useMemo<FirebaseContextValue>(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider value={firebaseContextValue}>{children}</FirebaseProvider>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * This hook is designed to be robust against race conditions during navigation
 * and re-rendering by explicitly managing its loading state.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or you may cause
 * infinite render loops.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When the document reference changes, we are in a new loading state.
    setIsLoading(true);
    setData(null);
    setError(null);

    // If the reference is null or undefined (e.g., user is logged out),
    // we are not fetching anything, so we are done loading.
    if (!memoizedDocRef) {
      setIsLoading(false);
      return;
    }

    // Subscribe to the document.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot) => {
        // When data arrives, update the state and set loading to false.
        const docData = snapshot.exists() ? { ...(snapshot.data() as T), id: snapshot.id } : null;
        setData(docData);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // If an error occurs, update the state, set loading to false, and emit a global error.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Unsubscribe on unmount or when the ref changes.
    return () => unsubscribe();
  }, [memoizedDocRef]); // Effect depends only on the memoized ref.

  return { data, isLoading, error };
}

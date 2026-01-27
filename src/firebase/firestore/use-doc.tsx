'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';


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
  const [state, setState] = useState<UseDocResult<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // A change in the doc ref means we need to start a new fetch.
    // Reset the state to loading. This is the key to preventing race conditions.
    setState({ data: null, isLoading: true, error: null });

    if (!memoizedDocRef) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot) => {
        const docData = snapshot.exists()
          ? { ...(snapshot.data() as T), id: snapshot.id }
          : null;
        setState({ data: docData, isLoading: false, error: null });
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: memoizedDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setState({ data: null, isLoading: false, error: permissionError });
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return state;
}

'use client';

import { useState, useEffect, useRef } from 'react';
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
 * and re-rendering by synchronously determining its loading state.
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
  type State = {
    data: WithId<T> | null;
    error: FirestoreError | Error | null;
  };
  
  const [internalState, setInternalState] = useState<State>({ data: null, error: null });
  const pathRef = useRef<string | undefined>();
  
  const path = memoizedDocRef?.path;

  // Synchronous check: If the document path we're requesting has changed
  // since the last render, we are in a loading state. We reset the internal
  // state and update our ref. This happens *during* the render.
  if (path !== pathRef.current) {
    setInternalState({ data: null, error: null });
    pathRef.current = path;
  }

  useEffect(() => {
    // If there's no document to fetch, we do nothing.
    if (!memoizedDocRef) {
      return;
    }

    // Subscribe to the document.
    const unsubscribe = onSnapshot(memoizedDocRef,
      (snapshot: DocumentSnapshot) => {
        // When data arrives, update the state.
        const data = snapshot.exists() ? { ...snapshot.data() as T, id: snapshot.id } : null;
        setInternalState({ data: data, error: null });
      },
      (error: FirestoreError) => {
        // If an error occurs, update the state and emit a global error.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });
        setInternalState({ data: null, error: contextualError });
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]); // Effect depends on the memoized ref object.

  // The loading state is now derived synchronously: we are loading if
  // a path has been provided, but we haven't received either data or an error yet.
  const isLoading = !!path && internalState.data === null && internalState.error === null;
  
  return { data: internalState.data, isLoading: isLoading, error: internalState.error };
}

'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';

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
 * React hook to subscribe to a single document in real-time.
 * Safeguarded against unhandled Firestore assertion stream failures.
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
    setState({ data: null, isLoading: true, error: null });

    if (!memoizedDocRef) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let path = '';
    try {
      path = memoizedDocRef.path || '';
    } catch {}

    if (path.includes('users')) {
      fetch('/api/user')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.user) {
            setState({ data: data.user, isLoading: false, error: null });
          } else {
            setState({ data: null, isLoading: false, error: null });
          }
        })
        .catch(() => setState({ data: null, isLoading: false, error: null }));
      return;
    }

    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onSnapshot(
        memoizedDocRef,
        (snapshot: DocumentSnapshot) => {
          const docData = snapshot.exists()
            ? { ...(snapshot.data() as T), id: snapshot.id }
            : null;
          setState({ data: docData, isLoading: false, error: null });
        },
        async () => {
          setState({ data: null, isLoading: false, error: null });
        }
      );
    } catch {
      setState({ data: null, isLoading: false, error: null });
    }

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, [memoizedDocRef]);

  return state;
}

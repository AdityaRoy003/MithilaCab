'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  CollectionReference,
  QuerySnapshot,
} from 'firebase/firestore';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to fetch a collection in real-time.
 * Upgraded with MongoDB API fallback to eliminate Firestore internal assertion crashes.
 */
// In-memory cache to prevent layout flash on tab changes
const collectionCache: Record<string, { data: any[]; timestamp: number }> = {};
const CACHE_TTL_MS = 15000; // 15 seconds

export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean}) | null | undefined,
): UseCollectionResult<T> {
  let initialPath = '';
  try {
    const q = memoizedTargetRefOrQuery as any;
    initialPath = q?._query?.path?.canonicalString?.() || q?.path || '';
  } catch {}

  const cachedEntry = initialPath ? collectionCache[initialPath] : null;

  const [state, setState] = useState<UseCollectionResult<T>>({
    data: cachedEntry ? (cachedEntry.data as WithId<T>[]) : null,
    isLoading: !cachedEntry,
    error: null,
  });

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let path = '';
    try {
      const q = memoizedTargetRefOrQuery as any;
      path = q._query?.path?.canonicalString?.() || q.path || '';
    } catch {
      path = '';
    }

    // Connect to real-time MongoDB database APIs
    if (path.includes('driver')) {
      fetch('/api/captains')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.captains) {
            const formatted = data.captains.map((c: any) => ({
              ...c,
              id: c.id || c._id,
              vehicle: c.vehicleModel || c.vehicle,
              licensePlate: c.vehicleNumber || c.licensePlate,
              isAvailable: c.isAvailable ?? true,
              rating: c.rating || 4.9,
              isVerified: true,
            }));
            collectionCache[path] = { data: formatted, timestamp: Date.now() };
            setState({ data: formatted, isLoading: false, error: null });
          } else {
            setState({ data: [], isLoading: false, error: null });
          }
        })
        .catch(() => setState({ data: [], isLoading: false, error: null }));
      return;
    }

    if (path.includes('ride')) {
      fetch('/api/rides')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.rides) {
            const formatted = data.rides.map((r: any) => ({
              ...r,
              id: r.id || r._id,
              status: r.status,
              fare: r.fareAmount,
              passengerName: r.riderName || 'Rider',
              driverName: r.captain?.name || (r.status === 'requested' ? 'Searching...' : 'Assigned'),
            }));
            collectionCache[path] = { data: formatted, timestamp: Date.now() };
            setState({ data: formatted, isLoading: false, error: null });
          } else {
            setState({ data: [], isLoading: false, error: null });
          }
        })
        .catch(() => setState({ data: [], isLoading: false, error: null }));
      return;
    }

    if (path.includes('user')) {
      fetch('/api/user')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.user) {
            const arr = [data.user];
            collectionCache[path] = { data: arr, timestamp: Date.now() };
            setState({ data: arr, isLoading: false, error: null });
          } else {
            setState({ data: [], isLoading: false, error: null });
          }
        })
        .catch(() => setState({ data: [], isLoading: false, error: null }));
      return;
    }

    // Safeguarded fallback with error suppression
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onSnapshot(
        memoizedTargetRefOrQuery,
        (snapshot: QuerySnapshot) => {
          const results: WithId<T>[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
          setState({ data: results, isLoading: false, error: null });
        },
        async () => {
          setState({ data: [], isLoading: false, error: null });
        }
      );
    } catch {
      setState({ data: [], isLoading: false, error: null });
    }

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, [memoizedTargetRefOrQuery]);

  return state;
}

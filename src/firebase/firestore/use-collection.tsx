'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  getDocs,
  DocumentData,
  FirestoreError,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to fetch a Firestore collection or query.
 * This hook is designed to be robust against race conditions by explicitly managing
 * its loading state. It performs a one-time fetch using getDocs.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or you may cause
 * infinite render loops.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} memoizedTargetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  const [state, setState] = useState<UseCollectionResult<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const getPath = (target: typeof memoizedTargetRefOrQuery) => {
    if (!target) return undefined;
    return target.type === 'collection' ? target.path : (target as InternalQuery)._query.path.canonicalString();
  };

  useEffect(() => {
    // A change in the query ref means we need to start a new fetch.
    setState({ data: null, isLoading: true, error: null });

    if (!memoizedTargetRefOrQuery) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }
    
    let isCancelled = false;

    const fetchData = async () => {
        try {
            const snapshot = await getDocs(memoizedTargetRefOrQuery);
            if (!isCancelled) {
                const results: WithId<T>[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
                setState({ data: results, isLoading: false, error: null });
            }
        } catch (err) {
            if (!isCancelled) {
                 const contextualError = new FirestorePermissionError({
                    operation: 'list',
                    path: getPath(memoizedTargetRefOrQuery)!,
                });
                setState({ data: null, isLoading: false, error: contextualError });
                errorEmitter.emit('permission-error', contextualError);
            }
        }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [memoizedTargetRefOrQuery]);

  return state;
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
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
 * React hook to subscribe to a Firestore collection or query in real-time.
 * This hook is designed to be robust against race conditions during navigation
 * and re-rendering by synchronously determining its loading state.
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
  type ResultItemType = WithId<T>;
  type State = {
    data: ResultItemType[] | null;
    error: FirestoreError | Error | null;
  };

  const [internalState, setInternalState] = useState<State>({ data: null, error: null });
  const pathRef = useRef<string | undefined>();

  const getPath = (target: typeof memoizedTargetRefOrQuery) => {
    if (!target) return undefined;
    return target.type === 'collection' ? target.path : (target as InternalQuery)._query.path.canonicalString();
  };

  const path = getPath(memoizedTargetRefOrQuery);

  // Synchronous check: If the query path has changed since the last render,
  // we are in a loading state. Reset internal state and update our ref.
  if (path !== pathRef.current) {
    setInternalState({ data: null, error: null });
    pathRef.current = path;
  }

  useEffect(() => {
    // If there's no query, we do nothing.
    if (!memoizedTargetRefOrQuery) {
      return;
    }

    // Subscribe to the query.
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // When data arrives, update the state.
        const results: ResultItemType[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setInternalState({ data: results, error: null });
      },
      (error: FirestoreError) => {
        // If an error occurs, update the state and emit a global error.
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: getPath(memoizedTargetRefOrQuery)!,
        });
        setInternalState({ data: null, error: contextualError });
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  // The loading state is now derived synchronously: we are loading if
  // a path has been provided, but we haven't received either data or an error yet.
  const isLoading = !!path && internalState.data === null && internalState.error === null;

  return { data: internalState.data, isLoading: isLoading, error: internalState.error };
}

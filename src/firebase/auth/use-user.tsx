'use client';

import { useState, useEffect } from 'react';

export interface AppUser {
  uid: string;
  id?: string;
  displayName: string;
  name?: string;
  phoneNumber: string;
  phone?: string;
  email: string;
  photoURL: string;
  avatar?: string;
  role?: 'user' | 'captain' | 'admin';
  walletBalance?: number;
}

const DEFAULT_USER: AppUser = {
  uid: 'usr_guest_1',
  id: 'usr_guest_1',
  displayName: 'Aditya Kumar',
  name: 'Aditya Kumar',
  phoneNumber: '+91 98765 43210',
  phone: '+91 98765 43210',
  email: 'rider@mithilagaadi.com',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'user',
  walletBalance: 350,
};

// Module-level in-memory cache to prevent repeated redundant network requests
let memoryUser: AppUser | null = null;
let lastUserFetchTime = 0;
const USER_CACHE_TTL = 30 * 1000; // 30 seconds TTL
let pendingUserPromise: Promise<AppUser | null> | null = null;

export function useUser() {
  const [user, setUser] = useState<AppUser>(DEFAULT_USER);

  useEffect(() => {
    // Read from localStorage safely after client hydration to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const u: AppUser = {
            uid: parsed.id || parsed._id || parsed.uid || DEFAULT_USER.uid,
            id: parsed.id || parsed._id,
            displayName: parsed.name || parsed.displayName || DEFAULT_USER.displayName,
            name: parsed.name || parsed.displayName || DEFAULT_USER.displayName,
            phoneNumber: parsed.phone || parsed.phoneNumber || DEFAULT_USER.phoneNumber,
            phone: parsed.phone || parsed.phoneNumber || DEFAULT_USER.phoneNumber,
            email: parsed.email || DEFAULT_USER.email,
            photoURL: parsed.avatar || parsed.photoURL || DEFAULT_USER.photoURL,
            avatar: parsed.avatar || parsed.photoURL || DEFAULT_USER.photoURL,
            role: parsed.role || 'user',
            walletBalance: parsed.walletBalance ?? DEFAULT_USER.walletBalance,
          };
          memoryUser = u;
          setUser(u);
        } catch {}
      }
    }

    const now = Date.now();
    // Skip network roundtrip if cache is fresh
    if (memoryUser && now - lastUserFetchTime < USER_CACHE_TTL) {
      return;
    }

    if (!pendingUserPromise) {
      pendingUserPromise = fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.authenticated && data.user) {
            const u = data.user;
            const formatted: AppUser = {
              uid: u.id || u._id || u.uid,
              id: u.id || u._id,
              displayName: u.name || u.displayName,
              name: u.name || u.displayName,
              phoneNumber: u.phone || u.phoneNumber,
              phone: u.phone || u.phoneNumber,
              email: u.email,
              photoURL: u.avatar || u.photoURL || DEFAULT_USER.photoURL,
              avatar: u.avatar || u.photoURL || DEFAULT_USER.photoURL,
              role: u.role || 'user',
              walletBalance: u.walletBalance ?? 350,
            };
            memoryUser = formatted;
            lastUserFetchTime = Date.now();
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_user', JSON.stringify(formatted));
            }
            return formatted;
          }
          return null;
        })
        .catch(() => null)
        .finally(() => {
          pendingUserPromise = null;
        });
    }

    pendingUserPromise.then((latestUser) => {
      if (latestUser) {
        setUser(latestUser);
      }
    });
  }, []);

  return { user, loading: false, isUserLoading: false };
}

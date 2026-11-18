'use client';

import { useUser } from './use-user';

export function useAdmin() {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@mithilagaadi.com';
  const role = user?.role === 'admin' ? ('admin' as const) : user?.role === 'captain' ? ('driver' as const) : ('passenger' as const);

  return {
    isAdmin,
    isAdminLoading: false,
    role,
  };
}

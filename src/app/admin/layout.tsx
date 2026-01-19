'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Once loading is complete, if the user is not an admin, redirect them.
    if (!isAdminLoading && !isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, isAdminLoading, router]);

  // If we are still verifying credentials, or if the user is not an admin
  // (and is about to be redirected), show a loading screen.
  // This prevents any flash of the admin dashboard for unauthorized users
  // and eliminates the redirect loop.
  if (isAdminLoading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo />
            <Skeleton className="h-8 w-64" />
            <p className="text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  // If we reach here, it means isAdminLoading is false and isAdmin is true.
  // We can safely render the admin dashboard.
  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
              <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Logo />
                <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
              </nav>
          </header>
          {children}
      </div>
  );
}

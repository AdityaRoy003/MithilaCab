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
    // Only check for redirection once loading is complete.
    if (!isAdminLoading && !isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, isAdminLoading, router]);

  // While verifying credentials, show a loading state.
  if (isAdminLoading) {
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

  // If loading is complete AND the user is an admin, render the dashboard.
  // The useEffect handles redirecting non-admins away.
  if (isAdmin) {
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

  // If loading is finished and user is not an admin, render the loading screen
  // while the redirect initiated by useEffect takes place. This prevents any
  // flash of content before the redirect.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo />
            <Skeleton className="h-8 w-64" />
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();

  // This useEffect handles the redirection logic.
  // It is now called on every render, and the condition is inside the hook,
  // which follows the Rules of Hooks.
  useEffect(() => {
    // Only redirect if loading is finished and the user is confirmed to not be an admin.
    if (!isAdminLoading && !isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, isAdminLoading, router]);

  // If we are still loading, or if the user is not an admin (and the redirect is about to happen),
  // show a unified loading/access-denied screen. This prevents any content flashing.
  if (isAdminLoading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Skeleton className="h-8 w-64" />
          <p className="text-muted-foreground">
            {isAdminLoading ? 'Verifying admin credentials...' : 'Access Denied. Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  // If we've finished loading and the user IS an admin, render the dashboard.
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Logo />
          <h1 className="text-lg font-semibold text-foreground">
            Admin Dashboard
          </h1>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}

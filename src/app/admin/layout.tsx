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

  // If we are still verifying the user's role, show a full-page loading skeleton.
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

  // If, after loading, the user is confirmed to NOT be an admin,
  // we redirect them to the home page.
  if (!isAdmin) {
    // We must use useEffect for navigation to avoid errors during rendering.
    useEffect(() => {
      router.replace('/home');
    }, [router]);

    // Return a loading skeleton here as well to prevent any flash of admin
    // content while the redirect is in progress.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Skeleton className="h-8 w-64" />
          <p className="text-muted-foreground">Access Denied. Redirecting...</p>
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

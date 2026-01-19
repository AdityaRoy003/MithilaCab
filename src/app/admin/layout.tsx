
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // On every render, check the state.
    // If we're done loading and the user is NOT an admin, redirect them.
    if (!isAdminLoading && !isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, isAdminLoading, router]);

  // If loading is not finished, show a full-page loader.
  // This prevents any flash of content.
  if (isAdminLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <p className="text-muted-foreground">
            Verifying admin credentials...
          </p>
        </div>
      </div>
    );
  }

  // If loading IS finished, AND the user is an admin, show the dashboard.
  // The useEffect above handles the case where the user is not an admin.
  if (isAdmin) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          <nav className="flex flex-row items-center gap-5 text-sm">
            <Logo />
            <h1 className="hidden text-lg font-semibold text-foreground md:block">
              Admin Dashboard
            </h1>
          </nav>
          <div>
            <Button asChild variant="outline" size="sm">
                <Link href="/home">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    );
  }
  
  // If loading is finished and the user is NOT an admin, the useEffect is redirecting them.
  // Render a loading screen to prevent content flashing during the redirect.
  return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
           <p className="text-muted-foreground">
            Access Denied. Redirecting...
          </p>
        </div>
      </div>
    );
}

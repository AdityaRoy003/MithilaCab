'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin } from "@/firebase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function HomePageLoadingSkeleton() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function HomePage() {
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // After the admin check is complete, if the user is an admin, redirect them.
    if (!isAdminLoading && isAdmin) {
      router.replace('/admin');
    }
  }, [isAdmin, isAdminLoading, router]);

  // While we check if the user is an admin, or if they are an admin and are about to be redirected,
  // show a loading skeleton. This prevents a flash of the passenger UI.
  if (isAdminLoading || isAdmin) {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
          <HomePageLoadingSkeleton />
        </main>
      </AppLayout>
    );
  }

  // If loading is complete and the user is NOT an admin, show the normal booking flow.
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
        <BookingFlow />
      </main>
    </AppLayout>
  );
}

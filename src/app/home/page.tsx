'use client';

import Link from 'next/link';
import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

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

function AdminWelcome() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Welcome, Admin!</CardTitle>
                    <CardDescription>You have administrative privileges.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="font-bold">
                        <Link href="/admin">
                            <Shield className="mr-2" />
                            Go to Admin Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function HomePage() {
  const { isAdmin, isAdminLoading } = useAdmin();

  // While we check if the user is an admin, show a loading skeleton.
  if (isAdminLoading) {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
          <HomePageLoadingSkeleton />
        </main>
      </AppLayout>
    );
  }

  // If loading is complete, render based on role.
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
        {isAdmin ? <AdminWelcome /> : <BookingFlow />}
      </main>
    </AppLayout>
  );
}

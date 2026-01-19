'use client';

import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

function AdminWelcome() {
    const router = useRouter();
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Welcome, Admin!</CardTitle>
                    <CardDescription>You are logged in as an administrator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        You can manage users, drivers, and system settings from your dashboard.
                    </p>
                    <Button onClick={() => router.push('/admin')} size="lg" className="font-bold">
                        <Shield className="mr-2" /> Go to Admin Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

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

  const mainContent = () => {
    if (isAdminLoading) {
      return <HomePageLoadingSkeleton />;
    }
    if (isAdmin) {
      return <AdminWelcome />;
    }
    return <BookingFlow />;
  };

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
        {mainContent()}
      </main>
    </AppLayout>
  );
}

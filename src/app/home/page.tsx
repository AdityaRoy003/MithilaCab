'use client';

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

  // The main content is determined here.
  const mainContent = () => {
    // Show a loading skeleton while we determine the user's role.
    if (isAdminLoading) {
      return <HomePageLoadingSkeleton />;
    }
    // All users, including admins, will now see the booking flow.
    // The previous logic to show a special welcome card for admins has been removed.
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

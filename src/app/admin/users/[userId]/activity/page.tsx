'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";
import { useRouter } from "next/navigation";


export default function UserActivityPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Profile
        </Button>

        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-muted p-3 rounded-full w-fit">
                    <Construction className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Feature Coming Soon</CardTitle>
                <CardDescription>
                    Detailed user activity logs will be available here in a future update.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    This section will track login times, booking patterns, cancellations, and more.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

'use client';

import { UserList } from './user-list';
import { DriverList } from './driver-list';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldCheck, LifeBuoy, Briefcase, Map, AreaChart, IndianRupee } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <Tabs defaultValue="management">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="management"><Users className="mr-2 h-4 w-4" /> User & Driver Mgmt</TabsTrigger>
        <TabsTrigger value="operations"><Briefcase className="mr-2 h-4 w-4" /> Ride & Operations</TabsTrigger>
        <TabsTrigger value="verification"><ShieldCheck className="mr-2 h-4 w-4" /> Verification</TabsTrigger>
        <TabsTrigger value="support"><LifeBuoy className="mr-2 h-4 w-4" /> Support & Disputes</TabsTrigger>
      </TabsList>
      <TabsContent value="management">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 mt-4">
          <UserList />
          <DriverList />
        </div>
      </TabsContent>
       <TabsContent value="operations">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Map /> Ride Dispatcher</CardTitle>
                    <CardDescription>Monitors live rides, assigns drivers manually if needed, and manages surge/cancellation workflows.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Live ride monitoring module coming soon.</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AreaChart /> Operations Manager</CardTitle>
                    <CardDescription>Tracks system reliability, monitors ride completion rates, and ensures smooth functioning.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>System analytics module coming soon.</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><IndianRupee /> Fare Manager</CardTitle>
                    <CardDescription>Adjusts fare rules, surge pricing, discounts, and promotional offers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Fare management module coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
      <TabsContent value="verification">
         <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Driver Verification</CardTitle>
                <CardDescription>Oversee driver onboarding, and verify licenses and vehicle information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>Driver verification module coming soon.</p>
                </div>
            </CardContent>
         </Card>
      </TabsContent>
      <TabsContent value="support">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LifeBuoy /> Customer Support</CardTitle>
                    <CardDescription>Resolve user and driver disputes, handle complaints, and manage support tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Support ticket module coming soon.</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Cancellations & Refunds</CardTitle>
                    <CardDescription>Process and manage ride cancellations and refund requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Cancellation/refund module coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

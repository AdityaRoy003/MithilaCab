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
import { Settings, Lock } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <Tabs defaultValue="management">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="management">Management</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="management">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 mt-4">
          <UserList />
          <DriverList />
        </div>
      </TabsContent>
      <TabsContent value="settings">
         <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings /> System Settings</CardTitle>
                <CardDescription>Overall application settings will be managed here.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>System Settings module coming soon.</p>
                </div>
            </CardContent>
         </Card>
      </TabsContent>
      <TabsContent value="permissions">
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock /> Permissions</CardTitle>
                <CardDescription>User roles and permissions will be managed here.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>Permissions module coming soon.</p>
                </div>
            </CardContent>
         </Card>
      </TabsContent>
    </Tabs>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Shield } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const adminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function ManageStaffPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  const form = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function handleCreateAdmin(values: z.infer<typeof adminFormSchema>) {
    try {
      const appName = `admin-creation-${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, appName);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      const userProfile = {
        id: user.uid,
        name: values.name,
        email: values.email,
        phone: "", // Phone is not required for admin creation
        dateJoined: serverTimestamp(),
        role: 'admin',
        isSuspended: false,
      };

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, userProfile);

      toast({
        title: "Admin Created",
        description: `Admin account for ${values.email} has been created.`,
      });
      setIsCreateAdminOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Admin Creation Error:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.code === 'auth/email-already-in-use' 
            ? 'An account with this email already exists.' 
            : error.message || "Could not create admin account.",
      });
    }
  }

  const handleNotImplemented = () => {
    toast({
        title: "Feature Coming Soon",
        description: "This functionality will be available in a future update.",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold">Manage Staff</h1>
      
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users /> Staff Accounts</CardTitle>
            <CardDescription>Create new administrators or other staff roles.</CardDescription>
          </div>
          <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Create Admin</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Enter the details for the new administrator account.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateAdmin)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g., admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Must be at least 6 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateAdminOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? 'Creating...' : 'Create Admin'}
                      </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Staff member list coming soon.</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2"><Shield /> Roles & Permissions</CardTitle>
                <CardDescription>Define custom roles and manage their access levels.</CardDescription>
            </div>
            <Button onClick={handleNotImplemented}><Plus className="mr-2 h-4 w-4" /> Add Role</Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Admin</TableCell>
                        <TableCell>Full Access</TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={handleNotImplemented}>Manage</Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Support</TableCell>
                        <TableCell>Manage users, view rides, process refunds</TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={handleNotImplemented}>Manage</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

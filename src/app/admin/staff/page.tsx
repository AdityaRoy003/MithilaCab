'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
import { Plus, Users, Shield, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@radix-ui/react-label';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'support' | 'passenger' | 'driver';
    photoURL?: string;
    dateJoined?: any;
}


const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["admin", "support"], { required_error: "Please select a role." }),
});


function StaffList() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
    const [newRole, setNewRole] = useState<'admin' | 'support' | 'passenger' | 'driver'>();
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

    const staffQuery = useMemoFirebase(
        () => query(collection(firestore, 'users'), where('role', 'in', ['admin', 'support'])),
        [firestore]
    );
    const { data: staff, isLoading } = useCollection<StaffMember>(staffQuery);

    const handleOpenRoleDialog = (user: StaffMember) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsRoleDialogOpen(true);
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !newRole) return;
        const userDocRef = doc(firestore, 'users', selectedUser.id);
        await updateDoc(userDocRef, { role: newRole });
        toast({
            title: 'Role Updated',
            description: `${selectedUser.name}'s role has been changed to ${newRole}.`
        });
        setIsRoleDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff && staff.map(member => (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={member.photoURL} alt={member.name} />
                                        <AvatarFallback>{member.name?.charAt(0) ?? 'S'}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{member.name}</div>
                                </div>
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>{member.role}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{member.dateJoined ? format(member.dateJoined.toDate(), 'PPP') : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${member.id}`)}>View Profile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenRoleDialog(member)}>Change Role</DropdownMenuItem>
                                    </DropdownMenuContent>
                               </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!staff || staff.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No staff members found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <AlertDialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Role for {selectedUser?.name}</AlertDialogTitle>
                        <AlertDialogDescription>Select a new role for this user. This will change their permissions across the app.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="role-select">Role</Label>
                        <Select value={newRole} onValueChange={(value) => setNewRole(value as any)}>
                            <SelectTrigger id="role-select">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="passenger">Passenger</SelectItem>
                                <SelectItem value="driver">Driver</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRoleChange}>Save Changes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


export default function ManageStaffPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);

  const form = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "support",
    },
  });

  async function handleCreateStaff(values: z.infer<typeof staffFormSchema>) {
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
        phone: "",
        dateJoined: serverTimestamp(),
        role: values.role,
        isSuspended: false,
      };

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, userProfile);

      toast({
        title: "Staff Created",
        description: `Account for ${values.email} has been created with the role: ${values.role}.`,
      });
      setIsCreateStaffOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Staff Creation Error:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.code === 'auth/email-already-in-use' 
            ? 'An account with this email already exists.' 
            : error.message || "Could not create staff account.",
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
          <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Create Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new staff account.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateStaff)} className="space-y-4 py-2">
                   <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          <Input type="email" placeholder="e.g., staff@example.com" {...field} />
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
                      <Button type="button" variant="outline" onClick={() => setIsCreateStaffOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? 'Creating...' : 'Create Staff'}
                      </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            <StaffList />
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

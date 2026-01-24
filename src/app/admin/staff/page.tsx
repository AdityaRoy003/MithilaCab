'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
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
import { Plus, Users, Shield, MoreHorizontal, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';


interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
    photoURL?: string;
    dateJoined?: any;
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  roleName: z.string().min(2, { message: "Role Name is required."}),
  permissions: z.array(z.string()).min(1, "At least one permission is required."),
});

const allPermissions = [
  { id: 'admin.full_access', label: 'Full Access (Admin)', description: 'Grants all permissions including managing roles.' },
  { id: 'users.manage', label: 'Manage Users', description: 'Can view, suspend, and delete user accounts.' },
  { id: 'drivers.manage', label: 'Manage Drivers', description: 'Can view, suspend, and delete driver accounts.' },
  { id: 'drivers.verify', label: 'Verify Drivers', description: 'Can approve or reject new driver applications.' },
  { id: 'rides.monitor', label: 'Monitor Rides', description: 'Can view all rides on the platform in real-time.' },
  { id: 'finance.view', label: 'View Finances', description: 'Can view financial reports and analytics.' },
  { id: 'finance.manage', label: 'Manage Finances', description: 'Can manage payouts and create incentives.' },
  { id: 'support.access', label: 'Access Support Tickets', description: 'Can view and respond to user support requests.' },
  { id: 'settings.manage', label: 'Manage Platform Settings', description: 'Can edit global settings like fares and commission.' },
];

const roleFormSchema = z.object({
  name: z.string().min(2, "Role name is required."),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required."),
});


function RoleFormDialog({ role, onFinished }: { role?: Role; onFinished: () => void; }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      permissions: role?.permissions || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof roleFormSchema>) => {
    try {
      if (role) {
        // Update existing role
        const roleRef = doc(firestore, 'roles', role.id);
        await updateDoc(roleRef, values);
        toast({ title: "Role Updated", description: `${values.name} has been updated.` });
      } else {
        // Create new role
        const rolesCol = collection(firestore, 'roles');
        await addDoc(rolesCol, values);
        toast({ title: "Role Created", description: `${values.name} has been added.` });
      }
      onFinished();
    } catch (error) {
      console.error("Error saving role:", error);
      toast({ variant: 'destructive', title: "Save Failed", description: "Could not save the role." });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        <DialogDescription>
          {role ? `Editing the ${role.name} role.` : 'Define a new role and assign permissions.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl><Input placeholder="e.g., Support Manager" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="e.g., Manages support tickets and user issues" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="permissions"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Permissions</FormLabel>
                  <p className="text-sm text-muted-foreground">Select the permissions for this role.</p>
                </div>
                <div className="space-y-2">
                  {allPermissions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="permissions"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{item.label}</FormLabel>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit">{role ? 'Save Changes' : 'Create Role'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}


function RolesAndPermissions({ roles, isLoading }: { roles: Role[] | null, isLoading: boolean }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>();

    const handleOpenDialog = (role?: Role) => {
        setEditingRole(role);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingRole(undefined);
        setIsDialogOpen(false);
    };

    const handleDeleteRole = async (role: Role) => {
        if (['admin', 'support', 'driver', 'passenger'].includes(role.id)) {
            toast({ variant: 'destructive', title: "Deletion Failed", description: "Cannot delete a default system role."});
            return;
        }
        await deleteDoc(doc(firestore, 'roles', role.id));
        toast({ title: "Role Deleted", description: `${role.name} has been deleted.`});
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Shield /> Roles & Permissions</CardTitle>
                    <CardDescription>View, edit, or delete existing roles and their access levels.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <RoleFormDialog role={editingRole} onFinished={handleCloseDialog} />
                    </DialogContent>
                </Dialog>
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
                        {isLoading && Array.from({length: 2}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-full"/></TableCell>
                                <TableCell><Skeleton className="h-8 w-20 ml-auto"/></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && roles?.map(role => (
                             <TableRow key={role.id}>
                                <TableCell>
                                    <p className="font-semibold">{role.name}</p>
                                    <p className="text-xs text-muted-foreground">{role.description}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.map(p => {
                                            const permDef = allPermissions.find(ap => ap.id === p);
                                            return <Badge variant="secondary" key={p}>{permDef?.label || p}</Badge>;
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleOpenDialog(role)}>Edit Role</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete Role</DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete {role.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. Users with this role will lose their permissions.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteRole(role)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function StaffList({ roles }: { roles: Role[] | null }) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
    const [newRole, setNewRole] = useState<string>();
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

    const staffQuery = useMemoFirebase(() => {
        // If roles are not loaded yet, or there are no roles, don't query.
        if (!roles || roles.length === 0) {
            return null;
        }
        const staffRoleIds = roles.map(r => r.id);
        if (staffRoleIds.length === 0) {
            return null; // No roles to query for
        }
        // Firestore 'in' queries are limited to 30 values, which is more than enough for roles.
        return query(collection(firestore, 'users'), where('role', 'in', staffRoleIds));
    }, [firestore, roles]);
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
            description: `${selectedUser.name}'s role has been changed to ${roles?.find(r => r.id === newRole)?.name}.`
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
                                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>{roles?.find(r => r.id === member.role)?.name || member.role}</Badge>
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
                                {roles?.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                ))}
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

  const rolesQuery = useMemoFirebase(() => query(collection(firestore, 'roles')), [firestore]);
  const { data: roles, isLoading: rolesLoading } = useCollection<Role>(rolesQuery);

  const form = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleName: "",
      permissions: [],
    },
  });

  async function handleCreateStaff(values: z.infer<typeof staffFormSchema>) {
    try {
      // 1. Create the new role definition
      const newRole = {
        name: values.roleName,
        permissions: values.permissions,
        description: `Custom role for ${values.name}`,
      };
      const roleDocRef = await addDoc(collection(firestore, 'roles'), newRole);

      // 2. Create the Auth user
      const appName = `admin-creation-${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, appName);
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, values.email, values.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: values.name });

      // 3. Create the user document with the new role
      const userProfile = {
        id: user.uid,
        name: values.name,
        email: values.email,
        phone: "",
        dateJoined: serverTimestamp(),
        role: roleDocRef.id, // Use the new role's ID
        isSuspended: false,
      };
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, userProfile);


      toast({
        title: "Staff Created",
        description: `Account for ${values.email} has been created with the role: ${values.roleName}.`,
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new staff account and define their role.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateStaff)} className="space-y-4 py-2">
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
                   <FormField
                    control={form.control}
                    name="roleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Support Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Permissions</FormLabel>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {allPermissions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                      <Checkbox
                                        checked={(field.value || []).includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                (field.value || []).filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>{item.label}</FormLabel>
                                      <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
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
            <StaffList roles={roles} />
        </CardContent>
      </Card>
      
      <RolesAndPermissions roles={roles} isLoading={rolesLoading} />
    </div>
  );
}

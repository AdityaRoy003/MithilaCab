'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MoreHorizontal, MessageSquare, Trash2, ShieldAlert } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  dateJoined?: Timestamp;
  isSuspended?: boolean;
  suspensionReason?: string;
}

export function UserList() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [suspensionReason, setSuspensionReason] = useState('');

  const usersQuery = useMemoFirebase(
    () => query(collection(firestore, 'users'), orderBy('dateJoined', 'desc')),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<User>(usersQuery);
  
  const getFormattedDate = (date: any) => {
    if (!date) return 'N/A';
    try {
        if (date instanceof Timestamp) {
            return format(date.toDate(), "PPP");
        }
        return format(new Date(date), "PPP");
    } catch {
        return 'Invalid Date';
    }
  }

  const handleSuspendUser = (userId: string, currentStatus: boolean, reason: string) => {
    if (!currentStatus && !reason) {
      toast({
          variant: "destructive",
          title: "Reason Required",
          description: "Please provide a reason for suspending the user.",
      });
      return;
    }

    const userRef = doc(firestore, 'users', userId);
    const updateData = { 
      isSuspended: !currentStatus,
      suspensionReason: !currentStatus ? reason : null,
    };

    updateDoc(userRef, updateData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      
    toast({
        title: `User ${!currentStatus ? 'Suspended' : 'Unsuspended'}`,
        description: `The user account has been successfully ${!currentStatus ? 'suspended' : 're-activated'}.`,
    });
    setSuspensionReason('');
  };

  const handleDeleteUser = (userId: string) => {
      const userRef = doc(firestore, 'users', userId);
      deleteDoc(userRef)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({
          title: "User Deleted",
          description: "The user account has been permanently removed.",
      });
  };

  const handleSendMessage = () => {
      toast({
          title: "Feature Coming Soon",
          description: "Direct messaging will be available in a future update.",
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Accounts</CardTitle>
        <CardDescription>A list of all registered users (passengers and drivers).</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )}
        {!isLoading && (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users && users.map(user => (
                        <TableRow 
                            key={user.id} 
                            className={cn(user.isSuspended ? "bg-muted/30" : "")}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={user.photoURL ?? undefined} alt={user.name} />
                                        <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name ?? 'Unnamed User'}</div>
                                        {user.isSuspended && <Badge variant="destructive" className="mt-1 items-center"><ShieldAlert className='mr-1 h-3 w-3'/>Suspended</Badge>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                            <TableCell className="hidden md:table-cell">{getFormattedDate(user.dateJoined)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>View profile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleSendMessage}><MessageSquare className="mr-2 h-4 w-4" /> Send Message</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={user.isSuspended ? "text-green-600 focus:text-green-600" : "text-destructive focus:text-destructive"}>
                                                    {user.isSuspended ? 'Un-suspend' : 'Suspend'}
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                    This action will {user.isSuspended ? 're-activate' : 'suspend'} the user's account. They {user.isSuspended ? 'will be able to' : 'will not be able to'} access the platform.
                                                     {!user.isSuspended && " Please provide a reason."}
                                                    </AlertDialogDescription>
                                                    {!user.isSuspended && (
                                                        <div className="space-y-2 pt-2 text-left">
                                                            <Label htmlFor="suspension-reason">Reason</Label>
                                                            <Textarea id="suspension-reason" placeholder="e.g., Violated community guidelines..." onChange={(e) => setSuspensionReason(e.target.value)} />
                                                        </div>
                                                    )}
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setSuspensionReason('')}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleSuspendUser(user.id, user.isSuspended || false, suspensionReason)}
                                                        className={!user.isSuspended ? buttonVariants({ variant: "destructive" }) : ''}
                                                    >
                                                        {user.isSuspended ? 'Yes, Un-suspend' : 'Yes, Suspend'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user's account and remove all their associated data. Note: this does not delete their Firebase Auth record.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className={buttonVariants({ variant: "destructive" })}>
                                                        Yes, Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!users || users.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No users found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}

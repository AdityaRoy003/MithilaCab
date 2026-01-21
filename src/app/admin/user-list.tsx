'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  dateJoined?: Timestamp;
  isSuspended?: boolean;
}

export function UserList() {
  const firestore = useFirestore();
  const router = useRouter();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Accounts</CardTitle>
        <CardDescription>A list of all registered passengers.</CardDescription>
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users && users.map(user => (
                        <TableRow 
                            key={user.id} 
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className={cn("cursor-pointer", user.isSuspended ? "opacity-50 bg-muted/20" : "")}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={user.photoURL ?? undefined} alt={user.name} />
                                        <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name ?? 'Unnamed User'}</div>
                                        {user.isSuspended && <Badge variant="destructive" className="mt-1">Suspended</Badge>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                            <TableCell className="hidden md:table-cell">{getFormattedDate(user.dateJoined)}</TableCell>
                        </TableRow>
                    ))}
                    {(!users || users.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}

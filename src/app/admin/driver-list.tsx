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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';


interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAvailable: boolean;
  rating: number;
  vehicle: string;
  image?: { imageUrl?: string; imageHint?: string; };
  dateJoined?: Timestamp;
  isSuspended?: boolean;
}

export function DriverList() {
  const firestore = useFirestore();
  const router = useRouter();
  const driversQuery = useMemoFirebase(
    () => query(collection(firestore, 'drivers'), orderBy('dateJoined', 'desc')),
    [firestore]
  );
  const { data: drivers, isLoading } = useCollection<Driver>(driversQuery);
  
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
        <CardTitle>Driver Accounts</CardTitle>
        <CardDescription>A list of all registered drivers.</CardDescription>
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
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers && drivers.map(driver => (
                        <TableRow 
                            key={driver.id} 
                            onClick={() => router.push(`/admin/drivers/${driver.id}`)}
                            className={cn("cursor-pointer", driver.isSuspended ? "opacity-50 bg-muted/20" : "")}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={driver.image?.imageUrl} alt={driver.name} data-ai-hint={driver.image?.imageHint}/>
                                        <AvatarFallback>{driver.name?.charAt(0) ?? 'D'}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{driver.name ?? 'Unnamed Driver'}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={driver.isAvailable ? 'default' : 'outline'}>
                                    {driver.isAvailable ? 'Available' : 'Offline'}
                                </Badge>
                                {driver.isSuspended && <Badge variant="destructive" className="ml-2">Suspended</Badge>}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{driver.rating?.toFixed(1) || 'N/A'}</TableCell>
                            <TableCell className="hidden md:table-cell">{getFormattedDate(driver.dateJoined)}</TableCell>
                        </TableRow>
                    ))}
                    {(!drivers || drivers.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No drivers found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}

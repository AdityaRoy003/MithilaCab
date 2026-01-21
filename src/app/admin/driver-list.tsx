'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
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
import { MoreHorizontal } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


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
  const { toast } = useToast();
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
  
  const handleSuspendDriver = async (driverId: string, currentStatus: boolean) => {
    const driverRef = doc(firestore, 'drivers', driverId);
    try {
        await updateDoc(driverRef, { isSuspended: !currentStatus });
        toast({
            title: `Driver ${!currentStatus ? 'Suspended' : 'Unsuspended'}`,
            description: `The driver account has been successfully ${!currentStatus ? 'suspended' : 're-activated'}.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the driver's status.",
        });
    }
  };

  const handleNotImplemented = (feature: string) => {
      toast({
        title: "Feature coming soon!",
        description: `${feature} is not yet available.`
      });
  };

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
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers && drivers.map(driver => (
                        <TableRow key={driver.id} className={driver.isSuspended ? "opacity-50 bg-muted/20" : ""}>
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
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/admin/drivers/${driver.id}`)}>View profile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleNotImplemented('Verify documents')}>Verify documents</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleNotImplemented('View performance')}>View performance</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem
                                                    onSelect={(e) => e.preventDefault()}
                                                    className={driver.isSuspended ? "text-green-600 focus:text-green-700" : "text-destructive focus:text-destructive"}
                                                >
                                                    {driver.isSuspended ? 'Un-suspend driver' : 'Suspend driver'}
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will {driver.isSuspended ? 're-activate' : 'suspend'} the driver's account. They {driver.isSuspended ? 'will be able to' : 'will not be able to'} accept rides.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleSuspendDriver(driver.id, driver.isSuspended || false)}
                                                        className={!driver.isSuspended ? buttonVariants({ variant: "destructive" }) : ''}
                                                    >
                                                        {driver.isSuspended ? 'Yes, Un-suspend' : 'Yes, Suspend'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!drivers || drivers.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No drivers found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}

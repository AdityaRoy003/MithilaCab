'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Driver } from '@/lib/data';

export function VerificationQueue() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const driversQuery = useMemoFirebase(
    () => query(collection(firestore, 'drivers'), where('isVerified', '==', false)),
    [firestore]
  );
  const { data: drivers, isLoading } = useCollection<Driver>(driversQuery);
  
  const handleApprove = async (driverId: string) => {
    const driverRef = doc(firestore, 'drivers', driverId);
    try {
        await updateDoc(driverRef, { isVerified: true });
        toast({
            title: 'Driver Approved',
            description: 'The driver has been verified and can now accept rides.'
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Approval Failed",
            description: "Could not verify the driver.",
        });
    }
  };

  const handleReject = async (driverId: string) => {
    const driverRef = doc(firestore, 'drivers', driverId);
    try {
        await deleteDoc(driverRef);
        toast({
            title: 'Driver Rejected',
            description: 'The driver account has been removed from the platform.'
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Rejection Failed",
            description: "Could not remove the driver.",
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Verification Queue</CardTitle>
        <CardDescription>Review and approve new driver applications.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )}
        {!isLoading && (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers && drivers.map(driver => (
                        <TableRow key={driver.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={driver.image?.imageUrl} alt={driver.name} data-ai-hint={driver.image?.imageHint}/>
                                        <AvatarFallback>{driver.name?.charAt(0) ?? 'D'}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{driver.name ?? 'Unnamed Driver'}</div>
                                </div>
                            </TableCell>
                            <TableCell>{driver.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{driver.dateJoined ? format(driver.dateJoined.toDate(), 'PPP') : 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/drivers/${driver.id}`)}>
                                    View
                                </Button>
                                <Button variant="default" size="sm" onClick={() => handleApprove(driver.id)}>
                                    Approve
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            Reject
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to reject?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will permanently delete the driver's application and all their data. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleReject(driver.id)} className={buttonVariants({ variant: "destructive" })}>
                                                Confirm Rejection
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!drivers || drivers.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No drivers awaiting verification.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}

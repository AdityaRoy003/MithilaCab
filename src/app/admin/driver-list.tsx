'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MoreHorizontal, MessageSquare, Trash2, CheckCircle, FileText, BarChart } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


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
  isVerified?: boolean;
}

export function DriverList() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

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

  const handleDeleteDriver = async (driverId: string) => {
    const driverRef = doc(firestore, 'drivers', driverId);
    try {
        await deleteDoc(driverRef);
        toast({
            title: "Driver Deleted",
            description: "The driver account has been permanently removed.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "Could not delete the driver's account.",
        });
    }
  };

  const handleSendMessage = () => {
    toast({
        title: "Feature Coming Soon",
        description: "Direct messaging will be available in a future update.",
    });
  };
  
  const handleVerifyDriver = async (driverId: string, currentStatus: boolean) => {
    const driverRef = doc(firestore, 'drivers', driverId);
    try {
        await updateDoc(driverRef, { isVerified: !currentStatus });
        toast({
            title: `Driver ${!currentStatus ? 'Verified' : 'Un-verified'}`,
            description: `The driver has been successfully ${!currentStatus ? 'verified' : 'marked as unverified'}.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the driver's verification status.",
        });
    }
  };

  const handleViewDocuments = () => {
    toast({
        title: "Feature Coming Soon",
        description: "Viewing driver documents will be available in a future update.",
    });
  };

  const handleViewPerformance = () => {
      toast({
          title: "Feature Coming Soon",
          description: "A detailed performance dashboard is coming soon.",
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
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers && drivers.map(driver => (
                        <TableRow 
                            key={driver.id} 
                            className={cn(driver.isSuspended ? "opacity-50 bg-muted/20" : "")}
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
                                {driver.isVerified ? (
                                    <Badge variant="secondary" className="ml-2 border-green-600">
                                        <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="ml-2 border-yellow-600 text-yellow-600">
                                        Not Verified
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{driver.rating?.toFixed(1) || 'N/A'}</TableCell>
                            <TableCell className="hidden md:table-cell">{getFormattedDate(driver.dateJoined)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/drivers/${driver.id}`)}>View profile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleViewDocuments}><FileText className="mr-2 h-4 w-4" /> View Documents</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleViewPerformance}><BarChart className="mr-2 h-4 w-4" /> View Performance</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleSendMessage}><MessageSquare className="mr-2 h-4 w-4" /> Send Message</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={driver.isVerified ? "text-yellow-600 focus:text-yellow-600" : "text-green-600 focus:text-green-600"}>
                                                    {driver.isVerified ? 'Mark as Unverified' : 'Verify Driver'}
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will {driver.isVerified ? 'revoke verification for' : 'verify'} this driver.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleVerifyDriver(driver.id, driver.isVerified || false)}
                                                        className={!driver.isVerified ? buttonVariants({ variant: "default" }) : ''}
                                                    >
                                                        {driver.isVerified ? 'Yes, Un-verify' : 'Yes, Verify'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={driver.isSuspended ? "text-green-600 focus:text-green-600" : "text-destructive focus:text-destructive"}>
                                                    {driver.isSuspended ? 'Un-suspend' : 'Suspend'}
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
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Driver
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Driver?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the driver's account and remove all their associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)} className={buttonVariants({ variant: "destructive" })}>
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

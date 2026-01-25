'use client';

import { useState } from 'react';
import Image from 'next/image';
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Check, X, FileText, User, Mail, Phone, Car } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  image?: { imageUrl?: string; imageHint?: string; };
  dateJoined?: any;
  isVerified?: boolean;
  documents?: {
      license?: string;
      rc?: string;
      insurance?: string;
      pollution?: string;
  }
}

const mockDocuments = {
    license: "https://picsum.photos/seed/license1/800/500",
    rc: "https://picsum.photos/seed/rc1/800/500",
    insurance: "https://picsum.photos/seed/insurance1/800/500",
    pollution: "https://picsum.photos/seed/pollution1/800/500",
};

export function VerificationQueue() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

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
        setSelectedDriver(null);
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
        setSelectedDriver(null);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Rejection Failed",
            description: "Could not remove the driver.",
        });
    }
  };

  return (
    <>
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
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedDriver(driver)}>
                                            Review
                                        </Button>
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

        <Dialog open={!!selectedDriver} onOpenChange={(isOpen) => !isOpen && setSelectedDriver(null)}>
            <DialogContent className="sm:max-w-4xl p-0">
                {selectedDriver && (
                    <>
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle>Review Application: {selectedDriver.name}</DialogTitle>
                            <DialogDescription>
                                Verify the driver's details and documents before approving their account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid md:grid-cols-2 gap-x-6 px-6 max-h-[70vh] overflow-y-auto">
                            {/* Driver Details */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Driver Profile</h3>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={selectedDriver.image?.imageUrl} alt={selectedDriver.name} data-ai-hint={selectedDriver.image?.imageHint}/>
                                            <AvatarFallback>{selectedDriver.name?.charAt(0) ?? 'D'}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="font-bold text-xl">{selectedDriver.name}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail size={14}/>{selectedDriver.email}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone size={14}/>{selectedDriver.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                <Separator/>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg">Vehicle Information</h3>
                                      <div className="flex items-center gap-2">
                                        <Car className="h-5 w-5 text-muted-foreground"/>
                                        <div>
                                            <p className="font-semibold">{selectedDriver.vehicle}</p>
                                            <p className="text-sm text-muted-foreground font-mono">{selectedDriver.licensePlate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Document Viewer */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Submitted Documents</h3>
                                <Tabs defaultValue="license" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="license">License</TabsTrigger>
                                        <TabsTrigger value="rc">Vehicle RC</TabsTrigger>
                                        <TabsTrigger value="insurance">Insurance</TabsTrigger>
                                        <TabsTrigger value="pollution">Pollution</TabsTrigger>
                                    </TabsList>
                                    <DocumentTabContent value="license" src={selectedDriver.documents?.license || mockDocuments.license} />
                                    <DocumentTabContent value="rc" src={selectedDriver.documents?.rc || mockDocuments.rc} />
                                    <DocumentTabContent value="insurance" src={selectedDriver.documents?.insurance || mockDocuments.insurance} />
                                    <DocumentTabContent value="pollution" src={selectedDriver.documents?.pollution || mockDocuments.pollution} />
                                </Tabs>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-muted/50 border-t flex-col sm:flex-row sm:justify-end gap-2">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <X className="mr-2 h-4 w-4" /> Reject Application
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
                                        <AlertDialogAction onClick={() => handleReject(selectedDriver.id)} className={buttonVariants({ variant: "destructive" })}>
                                            Confirm Rejection
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="default" onClick={() => handleApprove(selectedDriver.id)}>
                                <Check className="mr-2 h-4 w-4" /> Approve Driver
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </>
  );
}

const DocumentTabContent = ({ value, src }: { value: string, src: string }) => (
    <TabsContent value={value}>
        <div className="relative aspect-video w-full mt-2 rounded-md overflow-hidden border">
            <Image src={src} alt={`${value} document`} fill className="object-contain" />
        </div>
    </TabsContent>
);

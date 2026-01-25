'use client';

import { useState } from 'react';
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MoreHorizontal, MessageSquare, Trash2, CheckCircle, FileText, BarChart, ShieldAlert, Car, Mail, Phone } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAvailable: boolean;
  rating: number;
  vehicle: string;
  licensePlate: string;
  image?: { imageUrl?: string; imageHint?: string; };
  dateJoined?: Timestamp;
  isSuspended?: boolean;
  suspensionReason?: string;
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

const DocumentTabContent = ({ value, src }: { value: string, src: string }) => (
    <TabsContent value={value}>
        <div className="relative aspect-video w-full mt-2 rounded-md overflow-hidden border">
            <Image src={src} alt={`${value} document`} fill className="object-contain" />
        </div>
    </TabsContent>
);

export function DriverList() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [suspensionReason, setSuspensionReason] = useState('');
  const [viewingDocsDriver, setViewingDocsDriver] = useState<Driver | null>(null);
  const [messagingDriver, setMessagingDriver] = useState<Driver | null>(null);
  const [message, setMessage] = useState('');

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

  const handleSuspendDriver = async (driverId: string, currentStatus: boolean, reason: string) => {
      if (!currentStatus && !reason) {
          toast({
              variant: "destructive",
              title: "Reason Required",
              description: "Please provide a reason for suspending the driver.",
          });
          return;
      }
      
      const driverRef = doc(firestore, 'drivers', driverId);
      try {
          await updateDoc(driverRef, { 
              isSuspended: !currentStatus,
              suspensionReason: !currentStatus ? reason : null,
          });
          toast({
              title: `Driver ${!currentStatus ? 'Suspended' : 'Unsuspended'}`,
              description: `The driver account has been successfully ${!currentStatus ? 'suspended' : 're-activated'}.`,
          });
          setSuspensionReason('');
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

  const handleOpenMessageDialog = (driver: Driver) => {
    setMessagingDriver(driver);
    setMessage('');
  };

  const handleSendDriverMessage = () => {
    if (!messagingDriver || !message) {
        toast({
            variant: "destructive",
            title: "Message empty",
            description: "Cannot send an empty message.",
        });
        return;
    };
    toast({
        title: "Message Sent (Simulated)",
        description: `Your message has been sent to ${messagingDriver.name}. This is a UI demonstration.`,
    });
    setMessagingDriver(null);
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

  return (
    <>
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
                            className={cn(driver.isSuspended ? "bg-muted/30" : "")}
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
                                <div className='flex flex-wrap gap-1'>
                                    <Badge variant={driver.isAvailable ? 'default' : 'outline'}>
                                        {driver.isAvailable ? 'Available' : 'Offline'}
                                    </Badge>
                                    {driver.isSuspended && <Badge variant="destructive" className="items-center"><ShieldAlert className="mr-1 h-3 w-3" />Suspended</Badge>}
                                    {driver.isVerified ? (
                                        <Badge variant="secondary" className="border-green-600">
                                            <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="ml-2 border-yellow-600 text-yellow-600">
                                            Not Verified
                                        </Badge>
                                    )}
                                </div>
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
                                        <DropdownMenuItem onClick={() => setViewingDocsDriver(driver)}><FileText className="mr-2 h-4 w-4" /> View Documents</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push(`/admin/drivers/${driver.id}/performance`)}><BarChart className="mr-2 h-4 w-4" /> View Performance</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenMessageDialog(driver)}><MessageSquare className="mr-2 h-4 w-4" /> Send Message</DropdownMenuItem>
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
                                                        {!driver.isSuspended && " Please provide a reason."}
                                                    </AlertDialogDescription>
                                                     {!driver.isSuspended && (
                                                        <div className="space-y-2 pt-2 text-left">
                                                            <Label htmlFor="suspension-reason">Reason</Label>
                                                            <Textarea id="suspension-reason" placeholder="e.g., Violated community guidelines by..." onChange={(e) => setSuspensionReason(e.target.value)} />
                                                        </div>
                                                    )}
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setSuspensionReason('')}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleSuspendDriver(driver.id, driver.isSuspended || false, suspensionReason)}
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
    
    <Dialog open={!!viewingDocsDriver} onOpenChange={(isOpen) => !isOpen && setViewingDocsDriver(null)}>
        <DialogContent className="sm:max-w-4xl p-0">
            {viewingDocsDriver && (
                <>
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Documents for {viewingDocsDriver.name}</DialogTitle>
                        <DialogDescription>
                            Review the driver's submitted documents.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-x-6 px-6 max-h-[70vh] overflow-y-auto">
                        {/* Driver Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Driver Profile</h3>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={viewingDocsDriver.image?.imageUrl} alt={viewingDocsDriver.name} data-ai-hint={viewingDocsDriver.image?.imageHint}/>
                                    <AvatarFallback>{viewingDocsDriver.name?.charAt(0) ?? 'D'}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-bold text-xl">{viewingDocsDriver.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail size={14}/>{viewingDocsDriver.email}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone size={14}/>{viewingDocsDriver.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <Separator/>
                            <div className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">{viewingDocsDriver.vehicle}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{viewingDocsDriver.licensePlate}</p>
                                </div>
                            </div>
                        </div>
                        {/* Document Viewer */}
                        <div>
                            <Tabs defaultValue="license" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="license">License</TabsTrigger>
                                    <TabsTrigger value="rc">Vehicle RC</TabsTrigger>
                                    <TabsTrigger value="insurance">Insurance</TabsTrigger>
                                    <TabsTrigger value="pollution">Pollution</TabsTrigger>
                                </TabsList>
                                <DocumentTabContent value="license" src={viewingDocsDriver.documents?.license || mockDocuments.license} />
                                <DocumentTabContent value="rc" src={viewingDocsDriver.documents?.rc || mockDocuments.rc} />
                                <DocumentTabContent value="insurance" src={viewingDocsDriver.documents?.insurance || mockDocuments.insurance} />
                                <DocumentTabContent value="pollution" src={viewingDocsDriver.documents?.pollution || mockDocuments.pollution} />
                            </Tabs>
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-muted/50 border-t">
                        <Button variant="outline" onClick={() => setViewingDocsDriver(null)}>Close</Button>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
    </Dialog>

    <Dialog open={!!messagingDriver} onOpenChange={(isOpen) => !isOpen && setMessagingDriver(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send Message to {messagingDriver?.name}</DialogTitle>
                <DialogDescription>
                    Compose a direct message to the driver. They will receive it as a notification.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="message-text" className="sr-only">Message</Label>
                <Textarea id="message-text" placeholder="Type your message here..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setMessagingDriver(null)}>Cancel</Button>
                <Button onClick={handleSendDriverMessage}>Send Message</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

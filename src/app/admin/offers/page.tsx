
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Offer } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

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
import { Plus, ShoppingBag, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';


const offerSchema = z.object({
  partnerName: z.string().min(2, { message: "Partner name is required." }),
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  location: z.string().min(5, { message: "Location is required." }),
  category: z.enum(['Hotel', 'Restaurant', 'Shopping', 'Activity']),
  bannerImageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  isActive: z.boolean().default(true),
});

function OfferForm({ offer, onFinished }: { offer?: Offer; onFinished: () => void; }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: offer ? {
        ...offer,
    } : {
      partnerName: "",
      title: "",
      description: "",
      location: "",
      category: 'Shopping',
      bannerImageUrl: "",
      isActive: true,
    },
  });

  const onSubmit = (values: z.infer<typeof offerSchema>) => {
    if (offer) {
      const offerRef = doc(firestore, 'offers', offer.id);
      updateDocumentNonBlocking(offerRef, values);
      toast({ title: "Offer Updated", description: `${values.title} has been updated.` });
    } else {
      addDocumentNonBlocking(collection(firestore, 'offers'), values);
      toast({ title: "Offer Created", description: `${values.title} has been added.` });
    }
    onFinished();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{offer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
        <DialogDescription>
          {offer ? `Editing the offer from ${offer.partnerName}.` : 'Add a new promotional offer from a local partner.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <FormField control={form.control} name="partnerName" render={({ field }) => (
              <FormItem><FormLabel>Partner Name</FormLabel><FormControl><Input placeholder="e.g., Hotel Mithila" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Offer Title</FormLabel><FormControl><Input placeholder="e.g., 15% Off Your Stay" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
           <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., Show your ride receipt to avail the offer." {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem><FormLabel>Partner Location</FormLabel><FormControl><Input placeholder="e.g., Near Darbhanga Station" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
           <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="bannerImageUrl" render={({ field }) => (
              <FormItem><FormLabel>Banner Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>Activate Offer</FormLabel>
                    <p className="text-xs text-muted-foreground">Make this offer visible to users in the app.</p>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}/>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit">{offer ? 'Save Changes' : 'Create Offer'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}


export default function ManageOffersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>();

  const offersQuery = useMemoFirebase(() => query(collection(firestore, 'offers')), [firestore]);
  const { data: offers, isLoading } = useCollection<Offer>(offersQuery);
  
  const handleOpenDialog = (offer?: Offer) => {
    setEditingOffer(offer);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setEditingOffer(undefined);
    setIsDialogOpen(false);
  };

  const handleDeleteOffer = (offerId: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'offers', offerId));
    toast({ variant: 'destructive', title: 'Offer Deleted', description: 'The offer has been permanently removed.' });
  };
  
  return (
    <div className="space-y-8">
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <OfferForm offer={editingOffer} onFinished={handleCloseDialog} />
          </DialogContent>
        </Dialog>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ShoppingBag /> Local Offers & Deals</CardTitle>
            <CardDescription>Create, manage, and view promotional offers from local partners.</CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4"/> Create Offer</Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Offer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                    {isLoading && Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-10 w-full"/></TableCell>
                        </TableRow>
                    ))}
                    {offers?.map(offer => (
                        <TableRow key={offer.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Image src={offer.bannerImageUrl} alt={offer.partnerName} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
                                    <div>
                                        <p className="font-semibold">{offer.partnerName}</p>
                                        <p className="text-xs text-muted-foreground">{offer.category}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="font-medium">{offer.title}</p>
                                <p className="text-xs text-muted-foreground max-w-xs truncate">{offer.description}</p>
                            </TableCell>
                             <TableCell>
                                <Badge variant={offer.isActive ? 'default' : 'outline'}>
                                    {offer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                             </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleOpenDialog(offer)}><Edit className="mr-2 h-4 w-4"/> Edit Offer</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4"/> Delete Offer</DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this offer. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteOffer(offer.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && (!offers || offers.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No offers created yet. Click "Create Offer" to get started.
                            </TableCell>
                        </TableRow>
                    )}
                 </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

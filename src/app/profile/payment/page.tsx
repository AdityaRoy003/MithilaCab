'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Banknote, IndianRupee, CreditCard, Wallet, Plus, History, Tag, Trash2, Loader2, ScanQrCode, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, increment, Timestamp } from 'firebase/firestore';
import { format as formatDate } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface UserProfile {
    walletBalance?: number;
}

interface Transaction {
    id?: string;
    type: 'Top-up' | 'Ride Fare' | 'Refund' | 'Payout';
    date: Timestamp;
    amount: number;
    status: 'Success' | 'Pending' | 'Failed';
}

export default function PaymentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [paymentStep, setPaymentStep] = useState<'amount' | 'method' | 'pay_qr' | 'pay_upi' | 'processing'>('amount');
    const [upiId, setUpiId] = useState('');
    
    const qrCodeImage = PlaceHolderImages.find(img => img.id === 'upi-qr-code');

    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);
    
    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
    }, [firestore, user]);
    
    const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

    const isLoading = isUserLoading || profileLoading || transactionsLoading;

    const handleProceedToPayment = () => {
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive amount.' });
            return;
        }
        setPaymentStep('method');
    };

    const handleCompletePayment = () => {
        if (!user || !userDocRef) return;
        const amount = parseFloat(topUpAmount);

        setPaymentStep('processing');

        setTimeout(() => {
            const transactionData = {
                type: 'Top-up' as const,
                date: serverTimestamp(),
                amount: amount,
                status: 'Success' as const
            };
            const transactionsColRef = collection(firestore, 'users', user.uid, 'transactions');
            addDocumentNonBlocking(transactionsColRef, transactionData);

            updateDocumentNonBlocking(userDocRef, {
                walletBalance: increment(amount)
            });

            toast({ title: 'Top-up Successful', description: `₹${amount} has been added to your wallet.` });
            setIsTopUpOpen(false); // This will trigger the onOpenChange handler
        }, 2000);
    };
    
    const handleTopUpOpenChange = (open: boolean) => {
        setIsTopUpOpen(open);
        if (!open) {
            // Add a small delay to allow the closing animation to finish before resetting state
            setTimeout(() => {
                setPaymentStep('amount');
                setTopUpAmount('');
            }, 300);
        }
    };
    
    const handleAddPayment = (method: 'card' | 'upi') => {
        if (method === 'card') {
            toast({ title: 'Card Added', description: 'Your new card has been saved.' });
        } else {
            toast({ title: 'UPI ID Added', description: `UPI ID ${upiId} has been saved.` });
            setUpiId('');
        }
        setIsAddPaymentOpen(false);
    };


    const handleRemovePayment = () => {
        toast({ title: 'Payment Method Removed', description: 'The selected payment method has been removed.' });
    };

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push('/profile')} className="-ml-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Profile
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">Payments & Wallet</h1>

                    <div className="space-y-8">
                        {/* In-app Wallet */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Wallet /> MithilaCab Wallet</CardTitle>
                                <CardDescription>Your current wallet balance and options to manage it.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-lg border bg-background text-center">
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    {isLoading ? (
                                        <Skeleton className="h-10 w-32 mx-auto mt-1" />
                                    ) : (
                                        <p className="font-headline font-bold text-4xl flex items-center justify-center">
                                            <IndianRupee size={30} />
                                            {(userProfile?.walletBalance ?? 0).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                             <CardFooter className="flex gap-4">
                                <Dialog open={isTopUpOpen} onOpenChange={handleTopUpOpenChange}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full font-bold">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Top-up Balance
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        {paymentStep === 'amount' && (
                                            <>
                                                <DialogHeader>
                                                    <DialogTitle>Top-up Wallet</DialogTitle>
                                                    <DialogDescription>Enter the amount you want to add to your wallet.</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Label htmlFor="top-up-amount">Amount (₹)</Label>
                                                    <Input id="top-up-amount" type="number" placeholder="e.g., 500" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsTopUpOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleProceedToPayment}>Proceed to Pay</Button>
                                                </DialogFooter>
                                            </>
                                        )}
                                        {paymentStep === 'method' && (
                                            <>
                                                <DialogHeader>
                                                    <DialogTitle>Choose Payment Method</DialogTitle>
                                                    <DialogDescription>How would you like to pay ₹{parseFloat(topUpAmount).toFixed(2)}?</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4 space-y-4">
                                                    <Button variant="outline" className="w-full justify-start h-auto py-3" onClick={() => setPaymentStep('pay_qr')}>
                                                        <ScanQrCode className="mr-4 h-6 w-6" />
                                                        <div>
                                                            <p className="font-semibold">Scan UPI QR Code</p>
                                                            <p className="text-xs text-muted-foreground text-left">Pay using any UPI app</p>
                                                        </div>
                                                    </Button>
                                                    <Button variant="outline" className="w-full justify-start h-auto py-3" onClick={() => setPaymentStep('pay_upi')}>
                                                        <Banknote className="mr-4 h-6 w-6" />
                                                        <div>
                                                            <p className="font-semibold">Use Saved UPI ID</p>
                                                            <p className="text-xs text-muted-foreground text-left">user@upi</p>
                                                        </div>
                                                    </Button>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="ghost" onClick={() => setPaymentStep('amount')}>Back</Button>
                                                </DialogFooter>
                                            </>
                                        )}
                                        {paymentStep === 'pay_qr' && qrCodeImage && (
                                            <>
                                                <DialogHeader>
                                                    <DialogTitle>Complete Payment</DialogTitle>
                                                    <DialogDescription>Scan the QR code with your UPI app or click the button below.</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4 flex flex-col items-center gap-4">
                                                    <Image
                                                        src={qrCodeImage.imageUrl}
                                                        alt={qrCodeImage.description}
                                                        width={200}
                                                        height={200}
                                                        className="rounded-lg border"
                                                        data-ai-hint={qrCodeImage.imageHint}
                                                    />
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">Amount to Pay</p>
                                                        <p className="text-2xl font-bold">₹{parseFloat(topUpAmount).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                                                    <Button onClick={handleCompletePayment} className="w-full">
                                                        <ScanQrCode className="mr-2 h-4 w-4" /> Simulate Successful Payment
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setPaymentStep('method')}>Back</Button>
                                                </DialogFooter>
                                            </>
                                        )}
                                        {paymentStep === 'pay_upi' && (
                                            <>
                                                <DialogHeader>
                                                    <DialogTitle>Complete Payment</DialogTitle>
                                                    <DialogDescription>A payment request will be sent to your UPI app.</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-8 flex flex-col items-center gap-4 text-center">
                                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                                    <p className="text-muted-foreground">Waiting for you to complete the payment of <br/><span className="font-bold text-foreground">₹{parseFloat(topUpAmount).toFixed(2)}</span> via your UPI app.</p>
                                                </div>
                                                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                                                    <Button onClick={handleCompletePayment} className="w-full">
                                                        <CheckCircle className="mr-2 h-4 w-4" /> I have paid
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setPaymentStep('method')}>Back</Button>
                                                </DialogFooter>
                                            </>
                                        )}
                                         {paymentStep === 'processing' && (
                                            <>
                                                <DialogHeader>
                                                    <DialogTitle>Processing Payment</DialogTitle>
                                                    <DialogDescription>Please wait while we confirm your transaction.</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-12 flex flex-col items-center justify-center gap-4">
                                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                                    <p className="text-muted-foreground">This may take a moment...</p>
                                                </div>
                                            </>
                                        )}
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <History className="mr-2 h-4 w-4" />
                                            Transaction History
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Transaction History</DialogTitle>
                                        </DialogHeader>
                                        {isLoading ? (
                                            <div className="space-y-2 py-4">
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead className="text-right">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {transactions && transactions.length > 0 ? (
                                                        transactions.map(tx => (
                                                        <TableRow key={tx.id}>
                                                            <TableCell className="text-xs">{tx.date ? formatDate(tx.date.toDate(), 'PP') : 'N/A'}</TableCell>
                                                            <TableCell>{tx.type}</TableCell>
                                                            <TableCell className={`text-right font-mono ${tx.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                                                {tx.amount > 0 ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                                                            </TableCell>
                                                        </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center h-24">No transactions yet.</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>

                        {/* Saved Payment Methods */}
                        <Card>
                             <CardHeader>
                                <CardTitle>Saved Payment Methods</CardTitle>
                                <CardDescription>Manage your saved cards, UPI, and other payment options.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-md border">
                                    <div className="flex items-center gap-4">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                        <div>
                                            <p className="font-semibold">Visa •••• 1234</p>
                                            <p className="text-xs text-muted-foreground">Expires 12/25</p>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will remove the saved payment method from your account.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleRemovePayment}>Remove</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                 <div className="flex items-center justify-between p-3 rounded-md border">
                                    <div className="flex items-center gap-4">
                                        <Banknote className="h-6 w-6 text-green-500" />
                                        <div>
                                            <p className="font-semibold">user@upi</p>
                                            <p className="text-xs text-muted-foreground">UPI ID</p>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4 mr-1"/> Remove</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will remove the saved payment method from your account.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleRemovePayment}>Remove</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                                    <DialogTrigger asChild>
                                         <Button variant="outline" className="w-full">
                                            <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Payment Method</DialogTitle>
                                            <DialogDescription>Add a new credit/debit card or UPI ID.</DialogDescription>
                                        </DialogHeader>
                                        <Tabs defaultValue="card" className="w-full pt-4">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                                                <TabsTrigger value="upi">UPI</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="card">
                                                 <div className="py-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="card-number">Card Number</Label>
                                                        <Input id="card-number" placeholder="•••• •••• •••• ••••" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="expiry">Expiry</Label>
                                                            <Input id="expiry" placeholder="MM/YY" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="cvc">CVC</Label>
                                                            <Input id="cvc" placeholder="•••" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
                                                    <Button onClick={() => handleAddPayment('card')}>Add Card</Button>
                                                </DialogFooter>
                                            </TabsContent>
                                            <TabsContent value="upi">
                                                <div className="py-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="upi-id">UPI ID</Label>
                                                        <Input id="upi-id" placeholder="yourname@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
                                                    <Button onClick={() => handleAddPayment('upi')} disabled={!upiId}>Add UPI ID</Button>
                                                </DialogFooter>
                                            </TabsContent>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>

                        {/* Refunds & Credits */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Refunds & Credits</CardTitle>
                                <CardDescription>Track your promotional credits and pending refunds.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Tag className="h-5 w-5 text-accent" />
                                        <p className="font-semibold">Promo Credits</p>
                                    </div>
                                    <p className="font-bold flex items-center"><IndianRupee size={16} />50.00</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Fare Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Fare Breakdown</CardTitle>
                                <CardDescription>Our pricing is transparent. Here's a general breakdown.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <div className="flex justify-between"><span>Base Fare</span><span>Starts from ₹40</span></div>
                                <Separator />
                                <div className="flex justify-between"><span>Distance Charge</span><span>Based on per km rate</span></div>
                                <Separator />
                                <div className="flex justify-between"><span>Time Charge</span><span>Based on ride duration</span></div>
                                <Separator />
                                <div className="flex justify-between"><span>Taxes & Surcharges</span><span>Applicable as per govt. regulations</span></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

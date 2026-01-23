'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Banknote, IndianRupee, CreditCard, Wallet, Plus, History, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// Mock data
const mockTransactions = [
    { id: 't1', type: 'Top-up', date: '2024-07-30', amount: 500.00, status: 'Success' },
    { id: 't2', type: 'Ride Fare', date: '2024-07-29', amount: -120.50, status: 'Success' },
    { id: 't3', type: 'Refund', date: '2024-07-28', amount: 50.00, status: 'Success' },
    { id: 't4', type: 'Ride Fare', date: '2024-07-27', amount: -85.00, status: 'Success' },
];

export default function PaymentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');

    const handleTopUp = () => {
        if (!topUpAmount || +topUpAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to top up.' });
            return;
        }
        toast({ title: 'Top-up Successful', description: `₹${topUpAmount} has been added to your wallet.` });
        setIsTopUpOpen(false);
        setTopUpAmount('');
    };
    
    const handleAddPayment = () => {
        toast({ title: 'Payment Method Added', description: 'Your new payment method has been saved.' });
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
                                    <p className="font-headline font-bold text-4xl flex items-center justify-center">
                                        <IndianRupee size={30} />
                                        150.00
                                    </p>
                                </div>
                            </CardContent>
                             <CardFooter className="flex gap-4">
                                <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full font-bold">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Top-up Balance
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
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
                                            <Button onClick={handleTopUp}>Add to Wallet</Button>
                                        </DialogFooter>
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
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockTransactions.map(tx => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell className="text-xs">{tx.date}</TableCell>
                                                        <TableCell>{tx.type}</TableCell>
                                                        <TableCell className={`text-right font-mono ${tx.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                                            {tx.amount > 0 ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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
                                            <DialogDescription>Add a new credit/debit card. (This is a mock form)</DialogDescription>
                                        </DialogHeader>
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
                                            <Button onClick={handleAddPayment}>Add Card</Button>
                                        </DialogFooter>
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

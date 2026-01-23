'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Zap, Check, Star, Loader2, Award, Calendar, IndianRupee } from 'lucide-react';
import { useUser } from '@/firebase';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function PowerPassPage() {
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [isActive, setIsActive] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handlePurchase = () => {
        setPaymentStatus('processing');
        setTimeout(() => {
            setPaymentStatus('success');
            setIsActive(true);
            setIsDialogOpen(false); // Close dialog on success
            toast({ title: 'Power Pass Activated!', description: 'Your monthly pass is now active.' });
        }, 2000);
    };

    const getNextMonthDate = () => {
        const today = new Date();
        const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
        return format(nextMonth, 'PPP');
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
                    <h1 className="font-headline text-3xl font-bold mb-6">MithilaCab Power Pass</h1>
                    
                    {!isActive ? (
                         <Card className="text-center shadow-lg border-primary">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    <Zap className="h-12 w-12 text-primary" />
                                </div>
                                <CardTitle>Unlock Unlimited Savings</CardTitle>
                                <CardDescription>Join Power Pass to save on every ride, every day.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-4xl font-bold">₹99 <span className="text-lg font-normal text-muted-foreground">/ month</span></div>
                                <ul className="text-left space-y-3">
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> <span>No surge pricing, ever.</span></li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> <span>10% off on all rides.</span></li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> <span>Priority support.</span></li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> <span>Cancel anytime.</span></li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full font-bold text-lg h-12">
                                            Get Power Pass
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Your Purchase</DialogTitle>
                                            <DialogDescription>
                                                You are about to purchase the MithilaCab Power Pass for ₹99.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div className="p-4 rounded-lg bg-muted text-center">
                                                <p className="text-sm text-muted-foreground">Total Amount Due</p>
                                                <p className="font-bold text-3xl flex items-center justify-center gap-1">
                                                    <IndianRupee className="h-6 w-6"/>99.00
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground text-center">
                                                Your pass will be active for one month from today and will auto-renew. You can cancel anytime.
                                            </p>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={paymentStatus === 'processing'}>Cancel</Button>
                                            <Button onClick={handlePurchase} disabled={paymentStatus === 'processing'}>
                                                {paymentStatus === 'processing' ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : 'Confirm & Pay ₹99'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="bg-gradient-to-br from-primary via-primary/80 to-accent shadow-2xl text-primary-foreground">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-6 w-6" />
                                        <CardTitle className="text-2xl text-primary-foreground">Power Pass</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">Active</Badge>
                                </div>
                                <CardDescription className="text-primary-foreground/80 pt-2">Your exclusive member benefits are active.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-lg bg-primary-foreground/10 text-center">
                                    <p className="font-semibold text-lg">{user?.displayName}</p>
                                    <p className="text-sm opacity-80">Power Pass Member</p>
                                </div>
                                <Separator className="bg-primary-foreground/20" />
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="opacity-80 flex items-center gap-2"><Calendar className="h-4 w-4" /> Valid Until</span>
                                        <span className="font-semibold">{getNextMonthDate()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="opacity-80 flex items-center gap-2"><Star className="h-4 w-4" /> Benefits</span>
                                        <span className="font-semibold">10% Off, No Surge</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full bg-primary-foreground/90 text-primary hover:bg-primary-foreground">
                                    Manage Subscription
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}

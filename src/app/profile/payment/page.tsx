'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Banknote, IndianRupee, CreditCard, Wallet, Plus, History, Tag } from 'lucide-react';

export default function PaymentPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleNotImplemented = (e?: React.MouseEvent) => {
        e?.preventDefault();
        toast({
          title: "Feature coming soon!",
          description: "This feature is not yet available."
        })
    }

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
                                <Button onClick={handleNotImplemented} className="w-full font-bold">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Top-up Balance
                                </Button>
                                <Button onClick={handleNotImplemented} variant="outline" className="w-full">
                                    <History className="mr-2 h-4 w-4" />
                                    Transaction History
                                </Button>
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
                                    <Button variant="ghost" size="sm" onClick={handleNotImplemented}>Remove</Button>
                                </div>
                                 <div className="flex items-center justify-between p-3 rounded-md border">
                                    <div className="flex items-center gap-4">
                                        <Banknote className="h-6 w-6 text-green-500" />
                                        <div>
                                            <p className="font-semibold">user@upi</p>
                                            <p className="text-xs text-muted-foreground">UPI ID</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleNotImplemented}>Remove</Button>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button variant="outline" className="w-full" onClick={handleNotImplemented}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                                </Button>
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

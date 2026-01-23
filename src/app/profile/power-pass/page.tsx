'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Zap, Check } from 'lucide-react';

export default function PowerPassPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handlePurchase = () => {
        toast({ title: 'Power Pass Activated!', description: 'Your monthly pass is now active.' });
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
                            <Button className="w-full font-bold text-lg h-12" onClick={handlePurchase}>
                                Get Power Pass
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

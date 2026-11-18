'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Gift, Share2, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ReferPage() {
    const router = useRouter();
    const { toast } = useToast();
    const referralCode = "MITHILA24";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' });
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Join me on Mithila Gaadi (मिथिला गाड़ी)!',
            text: `Sign up for Mithila Gaadi with my referral code ${referralCode} and get ₹50 off your first Bike Taxi or Auto ride!`,
            url: window.location.href,
        };
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
            toast({ variant: 'destructive', title: 'Share Failed', description: 'Could not open share dialog.' });
        }
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
                    <h1 className="font-headline text-3xl font-bold mb-6">Refer & Earn</h1>
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                <Gift className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle>Invite Friends, Get Rewards</CardTitle>
                            <CardDescription>Share your referral code with friends. When they take their first ride, you both get a discount!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-sm text-muted-foreground">Your unique referral code</p>
                            <div className="flex items-center gap-2">
                                <Input readOnly value={referralCode} className="text-center font-mono text-lg tracking-widest h-12" />
                                <Button size="icon" variant="outline" onClick={handleCopy}><Copy className="h-5 w-5" /></Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full font-bold" onClick={handleShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share with Friends
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Award, Ticket, Leaf, Star, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const rewards = [
    { id: 'rw1', title: '50% Off First Ride', description: 'Get 50% off (up to ₹75) on your next ride.', expiry: 'Expires in 3 days', type: 'discount' },
    { id: 'rw2', title: '₹50 Cashback', description: 'Complete 3 rides this week to get ₹50 cashback in your wallet.', expiry: 'Expires on Sunday', type: 'cashback' },
    { id: 'rw3', title: 'Free Airport Drop', description: 'You have earned a free ride to the airport!', expiry: 'Expires in 25 days', type: 'free_ride' },
];

const achievements = [
    { id: 'ach1', title: 'Eco Rider', description: 'Completed your first shared ride.', icon: Leaf, achieved: true },
    { id: 'ach2', title: 'Green Miles', description: 'Travelled 50km in shared rides.', icon: Leaf, achieved: true },
    { id: 'ach3', title: 'Community Star', description: 'Travelled 250km in shared rides.', icon: Star, achieved: false },
    { id: 'ach4', title: 'Safety Pro', description: 'Enabled all safety features.', icon: Shield, achieved: true },
];

export default function RewardsPage() {
    const router = useRouter();
    const { toast } = useToast();

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
                    <h1 className="font-headline text-3xl font-bold mb-6">Rewards & Achievements</h1>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Ticket /> Available Coupons</CardTitle>
                                <CardDescription>Your collected rewards and ongoing offers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rewards.map(reward => (
                                    <div key={reward.id} className="flex items-center p-4 border rounded-lg gap-4">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <Ticket className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{reward.title}</p>
                                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline">{reward.expiry}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {rewards.length === 0 && <p className="text-center text-muted-foreground py-8">No rewards available right now.</p>}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Award /> Achievements</CardTitle>
                                <CardDescription>Your collected badges for various milestones.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {achievements.map(achievement => (
                                    <div key={achievement.id} className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center gap-2 ${achievement.achieved ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`p-3 rounded-full ${achievement.achieved ? 'bg-green-500/10' : 'bg-muted'}`}>
                                            <achievement.icon className={`h-8 w-8 ${achievement.achieved ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <p className="text-sm font-semibold">{achievement.title}</p>
                                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

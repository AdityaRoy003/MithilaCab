'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ParcelPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleSend = () => {
        toast({ title: 'Coming Soon!', description: 'Parcel delivery service is being finalized and will be available shortly.' });
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
                    <h1 className="font-headline text-3xl font-bold mb-6">Send a Parcel</h1>
                     <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                <Package className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle>City-to-City Delivery</CardTitle>
                            <CardDescription>Send items across Mithilanchal with the same speed and reliability as our rides.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="pickup">Pickup Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="pickup" placeholder="Enter pickup location" className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="destination" placeholder="Enter destination" className="pl-10" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full font-bold" onClick={handleSend}>
                                Find Delivery Options
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

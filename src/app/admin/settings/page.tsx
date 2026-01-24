'use client';

import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Percent, IndianRupee, Car, CarFront, Truck, Zap, Smartphone, FileWarning, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const settingsSchema = z.object({
  commissionRate: z.coerce.number().min(0).max(100, { message: 'Commission must be between 0 and 100.' }),
  currency: z.string().min(3, { message: 'Currency code must be 3 characters.' }).max(3),
  surgeMultiplier: z.coerce.number().min(1, { message: 'Surge multiplier must be at least 1.' }),
  standardBaseFare: z.coerce.number().min(0),
  standardPerKmRate: z.coerce.number().min(0),
  premiumBaseFare: z.coerce.number().min(0),
  premiumPerKmRate: z.coerce.number().min(0),
  suvBaseFare: z.coerce.number().min(0),
  suvPerKmRate: z.coerce.number().min(0),
});

interface PlatformSettings {
    commissionRate: number;
    currency: string;
    surgeMultiplier?: number;
    rideTypeSettings?: {
        Standard: { baseFare: number; perKmRate: number };
        Premium: { baseFare: number; perKmRate: number };
        SUV: { baseFare: number; perKmRate: number };
    };
}

export default function AdminSettingsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'platform'), [firestore]);
    const { data: settings, isLoading } = useDoc<PlatformSettings>(settingsDocRef);
    
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            commissionRate: 0,
            currency: 'INR',
            surgeMultiplier: 1,
            standardBaseFare: 40,
            standardPerKmRate: 12,
            premiumBaseFare: 60,
            premiumPerKmRate: 18,
            suvBaseFare: 80,
            suvPerKmRate: 22,
        },
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                commissionRate: settings.commissionRate * 100, // Display as percentage
                currency: settings.currency,
                surgeMultiplier: settings.surgeMultiplier ?? 1,
                standardBaseFare: settings.rideTypeSettings?.Standard.baseFare ?? 40,
                standardPerKmRate: settings.rideTypeSettings?.Standard.perKmRate ?? 12,
                premiumBaseFare: settings.rideTypeSettings?.Premium.baseFare ?? 60,
                premiumPerKmRate: settings.rideTypeSettings?.Premium.perKmRate ?? 18,
                suvBaseFare: settings.rideTypeSettings?.SUV.baseFare ?? 80,
                suvPerKmRate: settings.rideTypeSettings?.SUV.perKmRate ?? 22,
            });
        }
    }, [settings, form]);

    async function onSubmit(values: z.infer<typeof settingsSchema>) {
        const updatedSettings = {
            commissionRate: values.commissionRate / 100, // Store as decimal
            currency: values.currency.toUpperCase(),
            surgeMultiplier: values.surgeMultiplier,
            rideTypeSettings: {
                Standard: {
                    baseFare: values.standardBaseFare,
                    perKmRate: values.standardPerKmRate,
                },
                Premium: {
                    baseFare: values.premiumBaseFare,
                    perKmRate: values.premiumPerKmRate,
                },
                SUV: {
                    baseFare: values.suvBaseFare,
                    perKmRate: values.suvPerKmRate,
                }
            }
        };
        setDocumentNonBlocking(settingsDocRef, updatedSettings, { merge: true });
        toast({ title: 'Settings Saved', description: 'Platform settings have been updated.' });
    }

    const handleNotImplemented = () => {
        toast({
            title: "Feature Coming Soon",
            description: "This functionality will be available in a future update.",
        });
    };

    if (isLoading) {
        return (
             <div className="space-y-8">
                <h1 className="font-headline text-3xl font-bold">Platform Settings</h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
             </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-8"
        >
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="font-headline text-3xl font-bold">Platform Settings</h1>
                        <Button type="submit" disabled={form.formState.isSubmitting} className="font-bold">
                            {form.formState.isSubmitting ? 'Saving...' : 'Save All Settings'}
                        </Button>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Settings</CardTitle>
                                <CardDescription>Manage global financial settings like commission rates and currency.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="commissionRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Platform Commission Rate</FormLabel>
                                            <div className="relative">
                                                <Input type="number" placeholder="20" {...field} className="pl-8" />
                                                <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="surgeMultiplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Global Surge Multiplier</FormLabel>
                                            <div className="relative">
                                                <Input type="number" placeholder="1.0" step="0.1" {...field} className="pl-8" />
                                                <Zap className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency Code</FormLabel>
                                            <div className="relative">
                                                <Input placeholder="INR" {...field} className="pl-8" />
                                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ride Settings</CardTitle>
                                <CardDescription>Configure default ride parameters and types.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <RideTypePricing form={form} type="Standard" icon={Car} />
                                <Separator />
                                <RideTypePricing form={form} type="Premium" icon={CarFront} />
                                <Separator />
                                <RideTypePricing form={form} type="SUV" icon={Truck} />
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>

            <Separator />
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Send />Notification Manager</CardTitle>
                    <CardDescription>Send system-wide alerts or updates to all users and drivers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notification-title">Title</Label>
                            <Input id="notification-title" placeholder="e.g., Service Maintenance" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notification-message">Message</Label>
                            <Textarea id="notification-message" placeholder="Enter your system-wide message here..." />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleNotImplemented}>Send Notification</Button>
                </CardFooter>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Smartphone />App Version Monitor</CardTitle>
                        <CardDescription>Track which users are on outdated app versions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>App version monitor coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileWarning />Error Logs Viewer</CardTitle>
                        <CardDescription>See backend/API failures and debug info.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Error log viewer coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </motion.div>
    )
}

function RideTypePricing({ form, type, icon: Icon }: { form: any, type: "Standard" | "Premium" | "SUV", icon: React.ElementType }) {
    const baseFareName = `${type.toLowerCase()}BaseFare` as const;
    const perKmRateName = `${type.toLowerCase()}PerKmRate` as const;
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">{type}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-7">
                <FormField
                    control={form.control}
                    name={baseFareName}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Base Fare (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="40" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name={perKmRateName}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Per Km Rate (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="12" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}

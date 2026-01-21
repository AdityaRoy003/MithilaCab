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
import { Percent, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const settingsSchema = z.object({
  commissionRate: z.coerce.number().min(0).max(100, { message: 'Commission must be between 0 and 100.' }),
  currency: z.string().min(3, { message: 'Currency code must be 3 characters.' }).max(3),
});

interface PlatformSettings {
    commissionRate: number;
    currency: string;
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
        },
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                commissionRate: settings.commissionRate * 100, // Display as percentage
                currency: settings.currency,
            });
        }
    }, [settings, form]);

    async function onSubmit(values: z.infer<typeof settingsSchema>) {
        const updatedSettings = {
            commissionRate: values.commissionRate / 100, // Store as decimal
            currency: values.currency.toUpperCase(),
        };
        setDocumentNonBlocking(settingsDocRef, updatedSettings, { merge: true });
        toast({ title: 'Settings Saved', description: 'Platform settings have been updated.' });
    }

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
            <h1 className="font-headline text-3xl font-bold">Platform Settings</h1>
            
            <Card>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ride Settings</CardTitle>
                    <CardDescription>Configure default ride parameters and types. (Coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Ride type and pricing management coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

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
import { Percent, IndianRupee, Car, CarFront, Truck, Zap, Smartphone, FileWarning, Send, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, subHours, subMinutes } from 'date-fns';

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

const mockUserVersions = [
  { id: 'uv1', name: 'Ramesh Kumar', version: '1.0.0', platform: 'Android' },
  { id: 'uv2', name: 'Sita Devi', version: '0.9.8', platform: 'iOS' },
  { id: 'uv3', name: 'Madhavi Jha', version: '1.0.0', platform: 'iOS' },
  { id: 'uv4', name: 'Amit Singh', version: '1.0.0', platform: 'Android' },
];

const mockErrorLogs = [
  { id: 'el1', timestamp: subMinutes(new Date(), 5), message: "FirebaseError: Missing or insufficient permissions.", code: 'permission-denied', level: 'error' as const },
  { id: 'el2', timestamp: subMinutes(new Date(), 15), message: "Failed to fetch driver location: Timeout", code: 'deadline-exceeded', level: 'warning' as const },
  { id: 'el3', timestamp: subHours(new Date(), 1), message: "Ride booking conflict for user X.", code: 'aborted', level: 'info' as const },
  { id: 'el4', timestamp: subHours(new Date(), 2), message: "Payment gateway timeout for transaction Y.", code: 'unavailable', level: 'error' as const },
];

export default function AdminSettingsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'platform'), [firestore]);
    const { data: settings, isLoading } = useDoc<PlatformSettings>(settingsDocRef);
    
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
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

    const handleSendNotification = () => {
        if (!notificationTitle || !notificationMessage) {
            toast({
                variant: 'destructive',
                title: "Missing fields",
                description: "Please provide a title and a message for the notification.",
            });
            return;
        }
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Notification Sent",
                description: "Your notification has been broadcast to all users.",
            });
            setNotificationTitle('');
            setNotificationMessage('');
            setIsSending(false);
        }, 1500);
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
                            <Input id="notification-title" placeholder="e.g., Service Maintenance" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notification-message">Message</Label>
                            <Textarea id="notification-message" placeholder="Enter your system-wide message here..." value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSendNotification} disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Notification'}
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Smartphone />App Version Monitor</CardTitle>
                        <CardDescription>Track which users are on outdated app versions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Platform</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockUserVersions.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell><Badge variant={user.version === '1.0.0' ? 'default' : 'secondary'}>{user.version}</Badge></TableCell>
                                        <TableCell>{user.platform}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <div >
                            <CardTitle className="flex items-center gap-2"><FileWarning />Error Logs Viewer</CardTitle>
                            <CardDescription>See backend/API failures and debug info.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent className="h-72 overflow-y-auto">
                        <div className="space-y-4">
                            {mockErrorLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                         <Badge variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'secondary' : 'outline'}>
                                            {log.level}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <p className="font-mono text-xs text-muted-foreground">{log.code}</p>
                                        <p>{log.message}</p>
                                        <p className="text-xs text-muted-foreground">{format(log.timestamp, 'PPpp')}</p>
                                    </div>
                                </div>
                            ))}
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

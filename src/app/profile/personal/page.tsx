'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RideType } from '@/lib/data';


interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
    dateJoined?: Timestamp;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    dateOfBirth?: string;
    emergencyContact?: {
        name?: string;
        phone?: string;
    };
}


export default function PersonalInfoPage() {
    const { user, isUserLoading: authLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>();
    const [dateOfBirth, setDateOfBirth] = useState<Date>();
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setPhone(userProfile.phone || '');
            setGender(userProfile.gender);
            if (userProfile.dateOfBirth) {
                setDateOfBirth(new Date(userProfile.dateOfBirth));
            }
            setEmergencyContactName(userProfile.emergencyContact?.name || '');
            setEmergencyContactPhone(userProfile.emergencyContact?.phone || '');
        } else if (user) {
            setName(user.displayName || '');
        }
    }, [user, userProfile]);

    const handleSaveChanges = async () => {
        if (!auth.currentUser || !userDocRef) return;
        setIsSaving(true);
        try {
            if (auth.currentUser.displayName !== name) {
                await updateProfile(auth.currentUser, { displayName: name });
            }

            const updatedProfileData = {
                name,
                phone,
                gender,
                dateOfBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
                emergencyContact: {
                    name: emergencyContactName,
                    phone: emergencyContactPhone,
                }
            };
            
            setDoc(userDocRef, updatedProfileData, { merge: true })
                .catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: userDocRef!.path,
                        operation: 'update',
                        requestResourceData: updatedProfileData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });

            toast({
                title: "Profile Updated",
                description: "Your personal information has been saved successfully.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not update profile.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const loading = authLoading || profileLoading;

    if (loading) {
        return (
            <AppLayout>
                <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                     <Skeleton className="h-8 w-32 mb-6" />
                     <Skeleton className="h-96 w-full" />
                </main>
            </AppLayout>
        )
    }

    if (!user) return null;

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push('/profile')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </div>
                <h1 className="font-headline text-3xl font-bold mb-6">Personal Information</h1>
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Your Details</CardTitle>
                                <CardDescription>Make sure your information is up to date.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={user.email || ''} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={gender} onValueChange={(value) => setGender(value as any)}>
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Select your gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="dob"
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !dateOfBirth && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={dateOfBirth}
                                                onSelect={setDateOfBirth}
                                                initialFocus
                                                captionLayout="dropdown-buttons"
                                                fromYear={1920}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contact</CardTitle>
                                <CardDescription>This person will be contacted in case of an emergency.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-name">Contact Name</Label>
                                    <Input id="emergency-name" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-phone">Contact Phone</Label>
                                    <Input id="emergency-phone" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardFooter className="p-6">
                                <Button onClick={handleSaveChanges} disabled={isSaving} className="font-bold">
                                    {isSaving ? 'Saving...' : 'Save All Changes'}
                                </Button>
                            </CardFooter>
                         </Card>

                    </div>
                    <div className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Membership</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Member Since</p>
                                <p className="font-semibold">{userProfile?.dateJoined ? format(userProfile.dateJoined.toDate(), 'PPP') : 'N/A'}</p>
                            </CardContent>
                         </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

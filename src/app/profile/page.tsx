'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Briefcase, History, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { RideType } from '@/lib/data';


interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
    dateJoined?: any;
    savedAddresses?: {
        home?: string;
        work?: string;
    };
    preferences?: {
        defaultRideType?: RideType;
        language?: string;
        accessibilityNeeds?: boolean;
    };
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New state for profile features
  const [homeAddress, setHomeAddress] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [defaultRideType, setDefaultRideType] = useState<RideType>('Standard');
  const [language, setLanguage] = useState('en');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setHomeAddress(userProfile.savedAddresses?.home || '');
      setWorkAddress(userProfile.savedAddresses?.work || '');
      setDefaultRideType(userProfile.preferences?.defaultRideType || 'Standard');
      setLanguage(userProfile.preferences?.language || 'en');
      setAccessibilityNeeds(userProfile.preferences?.accessibilityNeeds || false);
    } else if(user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user, userProfile]);

  const handleSaveChanges = async () => {
    if (!auth.currentUser || !userDocRef) return;
    setIsSaving(true);
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
            displayName: name,
        });
      }

      const updatedProfileData = {
          name,
          phone,
          savedAddresses: {
              home: homeAddress,
              work: workAddress,
          },
          preferences: {
              defaultRideType,
              language,
              accessibilityNeeds,
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
        description: "Your information has been saved successfully.",
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

  const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth.currentUser) return;
      if (newPassword !== confirmPassword) {
          toast({ variant: "destructive", title: "Error", description: "New passwords do not match."});
          return;
      }
      if (newPassword.length < 6) {
          toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters."});
          return;
      }
      setIsUpdatingPassword(true);
      try {
        const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);

        toast({ title: "Password Updated", description: "Your password has been changed successfully." });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Password Update Failed",
              description: "Could not update password. Please check your current password and try again."
          });
      } finally {
          setIsUpdatingPassword(false);
      }
  }
  
  const loading = authLoading || profileLoading;

  if (loading) {
      return (
          <AppLayout>
              <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                  <h1 className="font-headline text-3xl font-bold mb-6">My Profile</h1>
                   <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center flex-col text-center">
                            <Skeleton className="h-32 w-32 rounded-full mb-4" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                   </div>
              </main>
          </AppLayout>
      )
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <h1 className="font-headline text-3xl font-bold mb-6">My Profile</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your details. Click "Save All Changes" at the bottom to apply.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Add your frequent locations for faster booking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="home-address">Home</Label>
                  <div className="relative flex items-center">
                    <Home className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input id="home-address" placeholder="e.g., 123 Main St, Your City" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-address">Work</Label>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input id="work-address" placeholder="e.g., 456 Business Ave, Your City" value={workAddress} onChange={(e) => setWorkAddress(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your app experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Ride Type</Label>
                  <Select value={defaultRideType} onValueChange={(value) => setDefaultRideType(value as RideType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a ride type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mai">Maithili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="accessibility" className="text-base">Accessibility Needs</Label>
                    <p className="text-sm text-muted-foreground">Request wheelchair accessible vehicles.</p>
                  </div>
                  <Switch id="accessibility" checked={accessibilityNeeds} onCheckedChange={setAccessibilityNeeds} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={handleSaveChanges} disabled={isSaving} className="font-bold">
                  {isSaving ? 'Saving...' : 'Save All Changes'}
                </Button>
              </CardFooter>
            </Card>

            <Card>
                <form onSubmit={handlePasswordChange}>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account's password. It's recommended to use a strong, unique password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isUpdatingPassword} className="font-bold">
                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <Card>
                <CardContent className="p-0">
                    <Link href="/history" className="flex items-center justify-between p-6 w-full">
                        <div className="flex items-center gap-4">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">My Rides</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
             <div className="flex items-center flex-col text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                  <AvatarFallback className="text-4xl">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Photo</Button>
             </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';

// Define UserProfile type based on backend.json
interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
    dateJoined?: any;
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

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
    } else if(user) { // Fallback to auth user data if profile is not yet created
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user, userProfile]);

  const handleSaveChanges = async () => {
    if (!auth.currentUser || !userDocRef) return;
    setIsSaving(true);
    try {
      // Update auth profile
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
            displayName: name,
        });
      }

      // Update Firestore document
      const updatedProfileData = {
        name: name,
        phone: phone,
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
        description: "Your personal information has been saved.",
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
                  <h1 className="font-headline text-3xl font-bold mb-6">My Profile</h1>
                   <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-32" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center flex-col text-center">
                            <Skeleton className="h-32 w-32 rounded-full mb-4" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                   </div>
              </main>
          </AppLayout>
      )
  }

  if (!user) {
    // This case is handled by AppLayout, but as a fallback
    return null;
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <h1 className="font-headline text-3xl font-bold mb-6">My Profile</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
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
                <Button onClick={handleSaveChanges} disabled={isSaving} className="font-bold">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
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

             <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="notifications" className="flex flex-col space-y-1">
                            <span>Email Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Receive updates and offers.
                            </span>
                        </Label>
                        <Switch id="notifications" defaultChecked />
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, setDoc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, Briefcase } from 'lucide-react';

interface UserProfile {
    savedAddresses?: {
        home?: string;
        work?: string;
    };
}

export default function SavedAddressesPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const [homeAddress, setHomeAddress] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setHomeAddress(userProfile.savedAddresses?.home || '');
      setWorkAddress(userProfile.savedAddresses?.work || '');
    }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    if (!userDocRef) return;
    setIsSaving(true);
    try {
      const updatedProfileData = {
          savedAddresses: {
              home: homeAddress,
              work: workAddress,
          },
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
        title: "Addresses Updated",
        description: "Your saved addresses have been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update addresses.",
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
                  <Skeleton className="h-8 w-40 mb-6" />
                  <Skeleton className="h-64 w-full max-w-2xl" />
              </main>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="mb-6">
            <Button variant="ghost" asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                </Link>
            </Button>
        </div>
        <h1 className="font-headline text-3xl font-bold mb-6">Saved Addresses</h1>
        
        <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Your Frequent Locations</CardTitle>
                <CardDescription>Add your home and work addresses for faster booking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="home-address">Home Address</Label>
                  <div className="relative flex items-center">
                    <Home className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input id="home-address" placeholder="e.g., 123 Main St, Your City" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-address">Work Address</Label>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input id="work-address" placeholder="e.g., 456 Business Ave, Your City" value={workAddress} onChange={(e) => setWorkAddress(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={handleSaveChanges} disabled={isSaving} className="font-bold">
                  {isSaving ? 'Saving...' : 'Save Addresses'}
                </Button>
              </CardFooter>
            </Card>
        </div>
      </main>
    </AppLayout>
  );
}

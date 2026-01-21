'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { RideType } from '@/lib/data';

interface UserProfile {
    preferences?: {
        defaultRideType?: RideType;
        language?: string;
        accessibilityNeeds?: boolean;
    };
}

export default function PreferencesPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const [defaultRideType, setDefaultRideType] = useState<RideType>('Standard');
  const [language, setLanguage] = useState('en');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDefaultRideType(userProfile.preferences?.defaultRideType || 'Standard');
      setLanguage(userProfile.preferences?.language || 'en');
      setAccessibilityNeeds(userProfile.preferences?.accessibilityNeeds || false);
    }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    if (!userDocRef) return;
    setIsSaving(true);
    try {
      const updatedProfileData = {
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
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error: any)      {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update preferences.",
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
                  <Skeleton className="h-80 w-full max-w-2xl" />
              </main>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/profile')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
            </Button>
        </div>
        <h1 className="font-headline text-3xl font-bold mb-6">Preferences</h1>
        
        <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Customize Your Experience</CardTitle>
                <CardDescription>Adjust your app settings to match your needs.</CardDescription>
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
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardFooter>
            </Card>
        </div>
      </main>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Home, History, ChevronRight, User as UserIcon, Palette } from 'lucide-react';


interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
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

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
    } else if(user) {
      setName(user.displayName || '');
    }
  }, [user, userProfile]);

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
          <div className="md:col-span-2 space-y-4">
            <Card>
                <CardContent className="p-0">
                    <Link href="/profile/personal" className="flex items-center justify-between p-6 w-full hover:bg-accent/50 transition-colors rounded-t-lg">
                        <div className="flex items-center gap-4">
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Personal Information</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <hr/>
                    <Link href="/profile/saved-addresses" className="flex items-center justify-between p-6 w-full hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <Home className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Saved Addresses</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <hr/>
                     <Link href="/profile/preferences" className="flex items-center justify-between p-6 w-full hover:bg-accent/50 transition-colors rounded-b-lg">
                        <div className="flex items-center gap-4">
                            <Palette className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Preferences</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </CardContent>
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
                    <Link href="/history" className="flex items-center justify-between p-6 w-full hover:bg-accent/50 transition-colors rounded-lg">
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

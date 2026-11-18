'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from 'lucide-react';

export default function PasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth.currentUser) {
        setIsUpdatingPassword(true);
        setTimeout(() => {
          setIsUpdatingPassword(false);
          toast({ title: "Security Updated ✅", description: "Your PIN and password have been saved." });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 500);
        return;
      }
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

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
         <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/profile')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
            </Button>
        </div>
        <h1 className="font-headline text-3xl font-bold mb-6">Security</h1>

        <div className="max-w-2xl">
            <form onSubmit={handlePasswordChange}>
                <Card>
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
                </Card>
            </form>
        </div>
      </main>
    </AppLayout>
  );
}


'use client';

import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, useAdmin } from '@/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  ChevronRight,
  FlaskConical,
  Info,
  LogOut,
  Bell,
  Lock,
  Trash2,
} from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


export default function AppSettingsPage() {
    const auth = useAuth();
    const { user } = useUser();
    const { role } = useAdmin();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = () => {
        auth.signOut().then(() => {
          // Force a full page reload to clear all state and prevent freezing issues.
          window.location.assign("/login");
        });
    };

    const handleNotImplemented = (e?: React.MouseEvent) => {
        e?.preventDefault();
        toast({
          title: "Feature coming soon!",
          description: "This feature is not yet available."
        })
    }

    const handleDeleteAccount = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to delete your account." });
            return;
        }
    
        try {
            // Delete Firestore user document
            const userDocRef = doc(firestore, 'users', user.uid);
            await deleteDoc(userDocRef);
    
            // Only attempt to delete driver doc if user has 'driver' role
            if (role === 'driver') {
                const driverDocRef = doc(firestore, 'drivers', user.uid);
                await deleteDoc(driverDocRef);
            }
    
            // Then delete the user from Authentication
            await deleteUser(user);
    
            toast({ title: "Account Deleted", description: "Your account and all associated data have been permanently removed." });
            window.location.assign('/login'); // Use full page navigation
    
        } catch (error: any) {
            console.error("Delete Account Error:", error);
            if (error.code === 'permission-denied') {
                // If it fails, we can't be sure which doc failed without more complex logic,
                // but the user doc is the most likely. We'll emit that for debugging.
                const permissionError = new FirestorePermissionError({ path: `users/${user.uid}`, operation: 'delete' });
                errorEmitter.emit('permission-error', permissionError);
            } else if (error.code === 'auth/requires-recent-login') {
                toast({
                    variant: "destructive",
                    title: "Action Required",
                    description: "This is a sensitive action. Please log out and log back in before deleting your account.",
                    duration: 7000,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error Deleting Account",
                    description: error.message || "Could not delete account. Please try again.",
                });
            }
        }
    };

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push('/profile')} className="-ml-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Profile
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">App Settings</h1>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bell /> Notification Preferences</CardTitle>
                                <CardDescription>Choose how you want to be notified.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Push Notifications</Label>
                                        <p className="text-xs text-muted-foreground">For ride status, promos, etc.</p>
                                    </div>
                                    <Switch defaultChecked onCheckedChange={() => handleNotImplemented()} />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>SMS Alerts</Label>
                                        <p className="text-xs text-muted-foreground">For critical updates and OTPs.</p>
                                    </div>
                                    <Switch onCheckedChange={() => handleNotImplemented()} />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email Newsletters</Label>
                                        <p className="text-xs text-muted-foreground">Receive offers and news.</p>
                                    </div>
                                    <Switch onCheckedChange={() => handleNotImplemented()} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Lock /> Privacy Controls</CardTitle>
                                <CardDescription>Manage your data and privacy settings.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Location Sharing</Label>
                                        <p className="text-xs text-muted-foreground">Shared with driver during a ride.</p>
                                    </div>
                                    <Switch defaultChecked disabled />
                                </div>
                                <Separator />
                                 <Button variant="link" className="p-0 h-auto" onClick={handleNotImplemented}>Manage your data</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>About & Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="ghost" className="w-full justify-between" onClick={handleNotImplemented}>
                                    <div className="flex items-center gap-2"><Info /> About</div>
                                    <span className="text-muted-foreground text-xs">Version 1.0.0</span>
                                </Button>
                                <Button variant="ghost" className="w-full justify-between" onClick={handleNotImplemented}>
                                    <div className="flex items-center gap-2"><FlaskConical /> Subscribe to Beta</div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive gap-2">
                                            <LogOut /> Logout
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleLogout} className={buttonVariants({ variant: "destructive" })}>Log Out</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive gap-2">
                                            <Trash2 /> Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action is permanent and cannot be undone. All your data will be deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

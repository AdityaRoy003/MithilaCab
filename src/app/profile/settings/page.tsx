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
import { useAuth, useUser, useFirestore } from '@/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  ChevronRight,
  FlaskConical,
  Info,
  LogOut,
  Smartphone,
  Trash2,
} from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { cn } from '@/lib/utils';

const SettingsListItem = ({ href, icon: Icon, title, subtitle, isAction = false, onAction, isDestructive = false, disabled = false, ...props }: { href?: string, icon: React.ElementType, title:string, subtitle?: string, isAction?: boolean, onAction?: (e: React.MouseEvent<Element, MouseEvent>) => void, isDestructive?: boolean, disabled?: boolean, [key:string]: any }) => {
    const content = (
        <div className={cn("flex items-center justify-between p-4 w-full text-left", isDestructive && "text-destructive", disabled && "opacity-50")}>
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-full", isDestructive ? "bg-destructive/10" : "bg-muted")}>
                   <Icon className={cn("h-5 w-5", isDestructive ? "text-destructive" : "text-primary")} />
                </div>
                <div>
                    <p className="font-medium">{title}</p>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {!isAction && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
    );

    const commonProps = {
        onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
          if (props.onClick) {
            props.onClick(e)
          }
          if (onAction) {
            onAction(e)
          }
        },
        disabled: disabled,
        className: "w-full h-full hover:bg-accent/50 transition-colors disabled:hover:bg-transparent disabled:cursor-not-allowed"
    };

    if (isAction) {
        return <button {...commonProps} {...props}>{content}</button>
    }
    
    // The issue was here. A Link component cannot be a direct child of AlertDialogTrigger when asChild is used.
    // The button must be the trigger.
    if (href && !disabled) {
        return (
             <button onClick={() => {
                const router = (props as any).router; // A bit of a hack to get the router
                if(router) router.push(href);
             }} className={commonProps.className} {...props}>
               {content}
             </button>
        )
    }

    return <button {...commonProps} {...props}>{content}</button>;
}

export default function AppSettingsPage() {
    const auth = useAuth();
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = () => {
        auth.signOut().then(() => {
          router.push("/");
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
    
            // Try to delete driver document, it might not exist, which is fine.
            try {
                const driverDocRef = doc(firestore, 'drivers', user.uid);
                await deleteDoc(driverDocRef);
            } catch (e) {
                // This might fail if the user is not a driver or due to permissions.
                // We'll log it but continue with account deletion.
                console.warn("Could not delete driver document, continuing with account deletion.", e);
            }
    
            // Then delete the user from Authentication
            await deleteUser(user);
    
            toast({ title: "Account Deleted", description: "Your account and all associated data have been permanently removed." });
            router.push('/');
    
        } catch (error: any) {
            console.error("Delete Account Error:", error);
            if (error.code === 'auth/requires-recent-login') {
                toast({
                    variant: "destructive",
                    title: "Action Required",
                    description: "This is a sensitive action. Please log out and log back in before deleting your account.",
                    duration: 5000,
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

                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem isAction onAction={handleNotImplemented} icon={Smartphone} title="App shortcuts" subtitle="Create shortcuts on home launcher" />
                       <SettingsListItem isAction onAction={handleNotImplemented} icon={Info} title="About" subtitle="App version 1.0.0" />
                       <SettingsListItem isAction onAction={handleNotImplemented} icon={FlaskConical} title="Subscribe to Beta" subtitle="Get early access to latest features" />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <SettingsListItem onSelect={(e) => e.preventDefault()} isAction icon={LogOut} title="Logout" />
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
                              <SettingsListItem onSelect={(e) => e.preventDefault()} isAction icon={Trash2} title="Delete Account" isDestructive />
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
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

'use client';

import Link from 'next/link';
import { doc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { useUser, useAuth, useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  HelpCircle,
  Info,
  LogOut,
  Shield,
  SlidersHorizontal,
  Trash2,
  User as UserIcon,
  Smartphone,
  FlaskConical,
} from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
}

const SettingsListItem = ({ href, icon: Icon, title, subtitle, isLogout = false, onAction, isDestructive = false, disabled = false }: { href?: string, icon: React.ElementType, title:string, subtitle?: string, isLogout?: boolean, onAction?: () => void, isDestructive?: boolean, disabled?: boolean }) => {
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
            {!isLogout && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
    );

    const commonProps = {
        onClick: onAction,
        disabled: disabled,
        className: "w-full h-full hover:bg-accent/50 transition-colors disabled:hover:bg-transparent disabled:cursor-not-allowed"
    };

    if (isLogout) {
        return <button {...commonProps}>{content}</button>
    }
    
    if (href && !disabled) {
        return (
            <Link href={href} className={commonProps.className}>
               {content}
            </Link>
        )
    }

    return <button {...commonProps}>{content}</button>;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);
  
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

  const loading = authLoading || profileLoading;

  if (loading) {
      return (
          <AppLayout>
              <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                  <div className="max-w-2xl mx-auto w-full">
                      <Skeleton className="h-10 w-48 mb-6" />
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-56 w-full" />
                      </div>
                  </div>
              </main>
          </AppLayout>
      )
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                 <Button variant="ghost" asChild className="-ml-4">
                    <Link href="/home">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <h1 className="font-headline text-2xl font-bold">Settings</h1>
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleNotImplemented}>
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Help</span>
                </Button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">GENERAL</h2>
                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem href="/profile/personal" icon={UserIcon} title="Profile" subtitle={userProfile.phone || userProfile.email} />
                       <SettingsListItem href="/profile/saved-addresses" icon={Heart} title="Favourites" subtitle="Manage favourite locations" />
                       <SettingsListItem href="/profile/preferences" icon={SlidersHorizontal} title="Preferences" subtitle="Manage preferences" />
                       <SettingsListItem isLogout onAction={handleNotImplemented} icon={Smartphone} title="App shortcuts" subtitle="Create shortcuts on home launcher" />
                       <SettingsListItem href="/profile/password" icon={Shield} title="Security" subtitle="Change your password" />
                    </div>
                </div>

                 <div>
                    <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">OTHERS</h2>
                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem isLogout onAction={handleNotImplemented} icon={Info} title="About" subtitle="App version 1.0.0" />
                       <SettingsListItem isLogout onAction={handleNotImplemented} icon={FlaskConical} title="Subscribe to Beta" subtitle="Get early access to latest features" />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <SettingsListItem isLogout onAction={()=>{}} icon={LogOut} title="Logout" />
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
                              <SettingsListItem isLogout onAction={()=>{}} icon={Trash2} title="Delete Account" isDestructive />
                           </Tritter>
                           <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action is permanent and cannot be undone. All your data will be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleNotImplemented} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </AppLayout>
  );
}

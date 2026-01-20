'use client';

import Link from 'next/link';
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
import { useAuth } from '@/firebase';
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
import { useRouter } from 'next/navigation';

const SettingsListItem = ({ href, icon: Icon, title, subtitle, isAction = false, onAction, isDestructive = false, disabled = false }: { href?: string, icon: React.ElementType, title:string, subtitle?: string, isAction?: boolean, onAction?: () => void, isDestructive?: boolean, disabled?: boolean }) => {
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
        onClick: onAction,
        disabled: disabled,
        className: "w-full h-full hover:bg-accent/50 transition-colors disabled:hover:bg-transparent disabled:cursor-not-allowed"
    };

    if (isAction) {
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

export default function AppSettingsPage() {
    const auth = useAuth();
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

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" asChild className="-ml-4">
                            <Link href="/profile">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Profile
                            </Link>
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">App Settings</h1>

                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem isAction onAction={handleNotImplemented} icon={Smartphone} title="App shortcuts" subtitle="Create shortcuts on home launcher" />
                       <SettingsListItem isAction onAction={handleNotImplemented} icon={Info} title="About" subtitle="App version 1.0.0" />
                       <SettingsListItem isAction onAction={handleNotImplemented} icon={FlaskConical} title="Subscribe to Beta" subtitle="Get early access to latest features" />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <SettingsListItem isAction onAction={()=>{}} icon={LogOut} title="Logout" />
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
                              <SettingsListItem isAction onAction={()=>{}} icon={Trash2} title="Delete Account" isDestructive />
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
                              <AlertDialogAction onClick={handleNotImplemented} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

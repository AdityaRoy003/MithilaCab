'use client';

import Link from 'next/link';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  HelpCircle,
  Shield,
  SlidersHorizontal,
  User as UserIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const SettingsListItem = ({ href, icon: Icon, title, subtitle }: { href: string, icon: React.ElementType, title:string, subtitle?: string }) => {
    return (
        <Link href={href} className="w-full h-full hover:bg-accent/50 transition-colors block">
             <div className={cn("flex items-center justify-between p-4 w-full text-left")}>
                <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-full", "bg-muted")}>
                       <Icon className={cn("h-5 w-5", "text-primary")} />
                    </div>
                    <div>
                        <p className="font-medium">{title}</p>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
        </Link>
    );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const handleNotImplemented = (e?: React.MouseEvent) => {
    e?.preventDefault();
    toast({
      title: "Feature coming soon!",
      description: "This feature is not yet available."
    })
  }

  if (authLoading) {
      return (
          <AppLayout>
              <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                  <div className="max-w-2xl mx-auto w-full">
                      <Skeleton className="h-10 w-48 mb-6" />
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-[22rem] w-full" />
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
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                 <Button variant="ghost" asChild className="-ml-4">
                    <Link href="/home">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <h1 className="font-headline text-2xl font-bold">Profile</h1>
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleNotImplemented}>
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Help</span>
                </Button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">ACCOUNT</h2>
                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem href="/profile/personal" icon={UserIcon} title="Personal Info" subtitle="Name, email, phone" />
                       <SettingsListItem href="/profile/password" icon={Shield} title="Security" subtitle="Change your password" />
                    </div>
                </div>

                 <div>
                    <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">PREFERENCES</h2>
                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem href="/profile/saved-addresses" icon={Heart} title="Saved Addresses" subtitle="Home, work, and more" />
                       <SettingsListItem href="/profile/preferences" icon={SlidersHorizontal} title="Ride Preferences" subtitle="Default ride type, etc." />
                       <SettingsListItem href="/profile/settings" icon={SettingsIcon} title="App Settings" subtitle="About, logout, and more" />
                    </div>
                </div>
            </div>
        </div>
      </main>
    </AppLayout>
  );
}

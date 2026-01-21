'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useUser, useAdmin } from "@/firebase";
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
  History,
  Package,
  CreditCard,
  ShieldCheck,
  Gift,
  Award,
  Ticket,
  IndianRupee,
  BarChart,
  BookOpen,
  Wrench,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const SettingsListItem = ({ href, icon: Icon, title, subtitle, onClick }: { href?: string, icon: React.ElementType, title:string, subtitle?: string, onClick?: (e: React.MouseEvent) => void }) => {
    const router = useRouter();
    const content = (
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
    );
    
    const className = "w-full h-full hover:bg-accent/50 transition-colors block";

    const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
        onClick(e);
      } else if (href) {
        router.push(href);
      }
    };

    return (
        <button onClick={handleClick} className={className}>
            {content}
        </button>
    );
}

export default function ProfilePage() {
  const { user, isUserLoading: authLoading } = useUser();
  const { role, isAdminLoading } = useAdmin();
  const { toast } = useToast();
  const router = useRouter();

  const handleNotImplemented = (e?: React.MouseEvent) => {
    e?.preventDefault();
    toast({
      title: "Feature coming soon!",
      description: "This feature is not yet available."
    })
  }

  const isLoading = authLoading || isAdminLoading;

  if (isLoading) {
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
  
  if (role === 'driver') {
      return (
          <AppLayout>
              <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                  <div className="max-w-2xl mx-auto w-full">
                      <div className="flex items-center justify-between mb-6">
                          <Button variant="ghost" onClick={() => router.push('/home')} className="-ml-4">
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back to Home
                          </Button>
                          <h1 className="font-headline text-2xl font-bold">Driver Profile</h1>
                          <Button variant="outline" size="icon" className="rounded-full" onClick={handleNotImplemented}>
                              <HelpCircle className="h-5 w-5" />
                              <span className="sr-only">Help</span>
                          </Button>
                      </div>
                      
                      <div className="space-y-8">
                          <div>
                              <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">DRIVER SETTINGS</h2>
                              <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                                 <SettingsListItem href="/profile/driver" icon={UserIcon} title="Personal & Vehicle Info" subtitle="Name, contact, vehicle details" />
                                 <SettingsListItem href="/driver/earnings" icon={IndianRupee} title="Earnings" subtitle="View your ride earnings" />
                                 <SettingsListItem href="/driver/performance" icon={BarChart} title="Performance" subtitle="Your ratings and ride statistics" />
                                 <SettingsListItem href="/profile/password" icon={Shield} title="Security" subtitle="Change your password" />
                              </div>
                          </div>
                           <div>
                              <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">RESOURCES & GROWTH</h2>
                              <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                                 <SettingsListItem href="/driver/training" icon={BookOpen} title="Training Modules" subtitle="Improve your skills and earnings" />
                                 <SettingsListItem onClick={handleNotImplemented} icon={Wrench} title="Vehicle Log" subtitle="Track fuel and maintenance" />
                                 <SettingsListItem onClick={handleNotImplemented} icon={Users} title="Community Hub" subtitle="Connect with other drivers" />
                                 <SettingsListItem onClick={handleNotImplemented} icon={Award} title="Achievements" subtitle="Your badges and milestones" />
                              </div>
                          </div>
                          
                          <div>
                              <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">SUPPORT & PREFERENCES</h2>
                              <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                                 <SettingsListItem href="/profile/safety" icon={ShieldCheck} title="Safety & Support" subtitle="Insurance, emergency contacts" />
                                 <SettingsListItem href="/profile/preferences" icon={SlidersHorizontal} title="App Preferences" subtitle="Language, accessibility" />
                              </div>
                          </div>
  
                          <div>
                              <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">GENERAL</h2>
                              <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                                 <SettingsListItem href="/profile/settings" icon={SettingsIcon} title="App Settings" subtitle="Theme, notifications, logout" />
                              </div>
                          </div>
                      </div>
                  </div>
              </main>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                 <Button variant="ghost" onClick={() => router.push('/home')} className="-ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
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
                    <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">ACTIVITY</h2>
                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem href="/history" icon={History} title="My Rides" subtitle="View your past and upcoming rides" />
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground px-4 mb-2">SUPPORT & REWARDS</h2>
                    <div className="bg-card rounded-lg border shadow-sm divide-y divide-border">
                       <SettingsListItem href="/profile/safety" icon={ShieldCheck} title="Safety & Support" />
                       <SettingsListItem onClick={handleNotImplemented} icon={Package} title="Parcel - Send Items" />
                       <SettingsListItem href="/profile/payment" icon={CreditCard} title="Payment" />
                       <SettingsListItem onClick={handleNotImplemented} icon={Gift} title="Refer and Earn" subtitle="Get ₹50" />
                       <SettingsListItem onClick={handleNotImplemented} icon={Award} title="My Rewards" />
                       <SettingsListItem onClick={handleNotImplemented} icon={Ticket} title="Power Pass" />
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

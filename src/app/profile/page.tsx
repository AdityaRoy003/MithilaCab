'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useUser, useAdmin } from "@/firebase";
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
  Car,
  Map,
  Wallet,
  Star,
  Zap,
  Edit2,
  Phone,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const SettingsListItem = ({
  href,
  icon: Icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  href?: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const router = useRouter();
  const content = (
    <div className="flex items-center justify-between p-3.5 sm:p-4 w-full text-left">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-muted/80 text-foreground group-hover:bg-amber-400/20 group-hover:text-amber-600 transition-colors">
          <Icon className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm sm:text-base text-foreground">{title}</p>
            {badge && (
              <Badge className="bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0 h-4 hover:bg-amber-400">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </div>
  );

  const className = "w-full hover:bg-accent/40 transition-colors block text-left group";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} type="button">
      {content}
    </button>
  );
};

let cachedWalletBalance: number | null = null;
let cachedTotalRides: number | null = null;

export default function ProfilePage() {
  const { user } = useUser();
  const { role } = useAdmin();
  const { toast } = useToast();
  const router = useRouter();

  const [walletBalance, setWalletBalance] = useState<number>(() => cachedWalletBalance ?? user?.walletBalance ?? 250);
  const [totalRides, setTotalRides] = useState<number>(() => cachedTotalRides ?? 0);

  useEffect(() => {
    fetch('/api/wallet')
      .then((r) => r.json())
      .then((d) => {
        if (d.walletBalance !== undefined) {
          cachedWalletBalance = d.walletBalance;
          setWalletBalance(d.walletBalance);
        }
      })
      .catch(() => { });

    fetch('/api/rides')
      .then((r) => r.json())
      .then((d) => {
        if (d.rides) {
          cachedTotalRides = d.rides.length;
          setTotalRides(d.rides.length);
        }
      })
      .catch(() => { });
  }, []);

  const handleNotImplemented = (e?: React.MouseEvent) => {
    e?.preventDefault();
    toast({
      title: "Coming soon!",
      description: "This feature will be available in the next update.",
    });
  };

  const displayName = user?.displayName || 'Aditya Kumar';
  const phoneNumber = user?.phoneNumber || '+91 98765 43210';
  const photoURL = user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  if (role === 'admin') {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => router.push('/admin')} className="-ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="font-headline text-2xl font-bold">Admin Profile</h1>
              <Button variant="outline" size="icon" className="rounded-full" onClick={handleNotImplemented}>
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">ADMIN ACTIONS</h2>
                <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
                  <SettingsListItem href="/admin/staff" icon={Users} title="Manage Staff" subtitle="Create admins, manage roles" />
                  <SettingsListItem href="/admin/users" icon={Users} title="Manage Users" />
                  <SettingsListItem href="/admin/drivers" icon={Car} title="Manage Drivers" />
                  <SettingsListItem href="/admin/rides" icon={Map} title="Ride Monitoring" />
                  <SettingsListItem href="/admin/finance" icon={Wallet} title="Finance" />
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">ACCOUNT SETTINGS</h2>
                <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
                  <SettingsListItem href="/profile/personal" icon={UserIcon} title="Personal Info" subtitle="Name, email, phone" />
                  <SettingsListItem href="/profile/password" icon={Shield} title="Security" subtitle="Change your password" />
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">GENERAL</h2>
                <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
                  <SettingsListItem href="/profile/settings" icon={SettingsIcon} title="App Settings" subtitle="Theme, notifications, logout" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </AppLayout>
    );
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

            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">DRIVER SETTINGS</h2>
                <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
                  <SettingsListItem href="/profile/driver" icon={UserIcon} title="Personal & Vehicle Info" subtitle="Name, contact, vehicle details" />
                  <SettingsListItem href="/driver/earnings" icon={IndianRupee} title="Earnings" subtitle="View your ride earnings" />
                  <SettingsListItem href="/driver/performance" icon={BarChart} title="Performance" subtitle="Your ratings and ride statistics" />
                  <SettingsListItem href="/profile/password" icon={Shield} title="Security" subtitle="Change your password" />
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">RESOURCES & GROWTH</h2>
                <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
                  <SettingsListItem href="/driver/training" icon={BookOpen} title="Training Modules" subtitle="Improve your skills and earnings" />
                  <SettingsListItem onClick={handleNotImplemented} icon={Wrench} title="Vehicle Log" subtitle="Track fuel and maintenance" />
                  <SettingsListItem onClick={handleNotImplemented} icon={Users} title="Community Hub" subtitle="Connect with other drivers" />
                  <SettingsListItem href="/profile/rewards" icon={Award} title="Achievements" subtitle="Your badges and milestones" />
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">GENERAL</h2>
                <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
                  <SettingsListItem href="/profile/settings" icon={SettingsIcon} title="App Settings" subtitle="Theme, notifications, logout" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 bg-muted/15">
        <div className="max-w-xl mx-auto w-full space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push('/home')} className="-ml-2 h-9 px-2 text-muted-foreground">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Home
            </Button>
            <h1 className="font-headline text-lg sm:text-xl font-black">My Profile</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNotImplemented}>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Help</span>
            </Button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-card border border-amber-400/30 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Avatar className="h-14 w-14 ring-2 ring-amber-400/60 shadow-sm">
                  <AvatarImage src={photoURL} alt={displayName} />
                  <AvatarFallback className="bg-amber-400 text-black font-black text-lg" suppressHydrationWarning>
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg font-black text-foreground">{displayName}</h2>
                    <Badge variant="secondary" className="bg-amber-400/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] px-1.5 py-0 h-4">
                      Rider
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {phoneNumber}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="flex items-center gap-0.5 text-xs font-black bg-amber-400 text-black px-1.5 py-0.2 rounded-md">
                      <Star className="h-3 w-3 fill-black text-black" /> 4.95
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">{totalRides} trips completed</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-amber-400/40" asChild>
                <Link href="/profile/personal">
                  <Edit2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit Profile</span>
                </Link>
              </Button>
            </div>

            {/* Quick Action Pills inside Card */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/60">
              <Link href="/profile/payment" className="flex flex-col items-center justify-center p-2 rounded-2xl bg-background/80 hover:bg-background transition-colors text-center border border-border/50">
                <Wallet className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-xs font-black text-foreground">₹{walletBalance}</span>
                <span className="text-[10px] text-muted-foreground">Mithila Wallet</span>
              </Link>
              <Link href="/history" className="flex flex-col items-center justify-center p-2 rounded-2xl bg-background/80 hover:bg-background transition-colors text-center border border-border/50">
                <History className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-xs font-black text-foreground">{totalRides}</span>
                <span className="text-[10px] text-muted-foreground">My Rides</span>
              </Link>
              <Link href="/profile/power-pass" className="flex flex-col items-center justify-center p-2 rounded-2xl bg-background/80 hover:bg-background transition-colors text-center border border-border/50">
                <Zap className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-xs font-black text-amber-500">25% OFF</span>
                <span className="text-[10px] text-muted-foreground">Power Pass</span>
              </Link>
            </div>
          </div>

          {/* Group 1: Rides & Services */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">SERVICES & RIDES</h2>
            <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
              <SettingsListItem href="/history" icon={History} title="My Rides" subtitle="View ride details and download receipts" />
              <SettingsListItem href="/profile/parcel" icon={Package} title="Send Parcel" subtitle="Deliver packages anywhere in Mithila" badge="FAST" />
              <SettingsListItem href="/profile/power-pass" icon={Ticket} title="Power Pass" subtitle="Save 25% on every Bike & Auto ride" badge="25% OFF" />
            </div>
          </div>

          {/* Group 2: Payments & Offers */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">PAYMENTS & OFFERS</h2>
            <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
              <SettingsListItem href="/profile/payment" icon={CreditCard} title="Mithila Wallet & UPI" subtitle="Balance: ₹350 • Top-up & transactions" />
              <SettingsListItem href="/profile/refer" icon={Gift} title="Refer and Earn" subtitle="Invite friends and get ₹50 each" badge="EARN ₹50" />
              <SettingsListItem href="/profile/rewards" icon={Award} title="Rewards & Coins" subtitle="Claim discounts and unlock badges" />
            </div>
          </div>

          {/* Group 3: Account & Safety */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">ACCOUNT & SAFETY</h2>
            <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
              <SettingsListItem href="/profile/personal" icon={UserIcon} title="Personal Info" subtitle="Name, phone number, email" />
              <SettingsListItem href="/profile/saved-addresses" icon={Heart} title="Saved Addresses" subtitle="Home, office, and frequent spots" />
              <SettingsListItem href="/profile/safety" icon={ShieldCheck} title="Safety & Emergency Contacts" subtitle="24/7 SOS, ride insurance, emergency contacts" />
              <SettingsListItem href="/profile/password" icon={Shield} title="Security & Password" subtitle="Update login PIN and password" />
            </div>
          </div>

          {/* Group 4: App Preferences */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">PREFERENCES & SUPPORT</h2>
            <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border overflow-hidden">
              <SettingsListItem href="/profile/preferences" icon={SlidersHorizontal} title="Ride Preferences" subtitle="Default ride type, accessibility" />
              <SettingsListItem href="/profile/help-center" icon={HelpCircle} title="Help & Support" subtitle="Raise ticket, chat with Mithila support" />
              <SettingsListItem href="/profile/settings" icon={SettingsIcon} title="App Settings" subtitle="Dark mode, notifications, log out" />
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

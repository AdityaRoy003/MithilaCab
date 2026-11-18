'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  LogOut,
  Shield,
  Bell,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  Bike,
  Package,
  History,
  Home,
  UserCircle,
  HelpCircle,
  Wallet,
} from 'lucide-react';
import { useUser, useDriver, useAdmin } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
} from '@/components/ui/alert-dialog';

import { Logo } from './logo';
import { Separator } from './ui/separator';
import { NotificationsPanel } from './notifications-panel';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const { driver, isDriverLoading } = useDriver();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.assign('/login');
    }
  };

  const isDriverMode = pathname.startsWith('/driver');

  const handleRoleChange = (isDriver: boolean) => {
    router.push(isDriver ? '/driver' : '/home');
  };

  if (!mounted || !user) {
    return (
      <Button variant="secondary" size="icon" className="rounded-full ring-2 ring-amber-400/40">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-amber-400 text-black font-bold" suppressHydrationWarning>
            U
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full ring-2 ring-amber-400/40">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
            <AvatarFallback className="bg-amber-400 text-black font-bold" suppressHydrationWarning>
              {user.displayName?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user.displayName ?? 'Aditya Kumar'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email ?? '+91 98765 43210'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4 text-amber-500" />
            <span>Profile & Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/payment" className="cursor-pointer">
            <Wallet className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Wallet & Cash</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/history" className="cursor-pointer">
            <History className="mr-2 h-4 w-4 text-sky-500" />
            <span>My Rides & Parcels</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/safety" className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4 text-red-500" />
            <span>Safety Shield (SOS)</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4 text-amber-500" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between w-full cursor-pointer">
            <Label htmlFor="driver-mode-switch" className="font-semibold text-xs cursor-pointer flex items-center gap-1.5">
              <Bike className="h-3.5 w-3.5 text-amber-500" />
              <span>Captain Mode</span>
            </Label>
            <Switch
              id="driver-mode-switch"
              checked={isDriverMode}
              onCheckedChange={handleRoleChange}
              className="data-[state=checked]:bg-amber-400"
            />
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You can easily log back in anytime using your mobile number or demo profile.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold">
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile Bottom Navigation Bar (like Rapido / Ola / Uber)
function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Rides', href: '/home', icon: Home },
    { label: 'Parcel', href: '/profile/parcel', icon: Package },
    { label: 'Captain', href: '/driver', icon: Bike, highlight: true },
    { label: 'History', href: '/history', icon: History },
    { label: 'Account', href: '/profile', icon: UserCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex flex-col items-center justify-center py-1 transition-all rounded-xl relative select-none',
                isActive ? 'text-amber-500 font-black' : 'text-muted-foreground hover:text-foreground font-medium'
              )}
            >
              {item.highlight && (
                <span className="absolute -top-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-black uppercase tracking-wider shadow-xs">
                  Earn
                </span>
              )}
              <div
                className={cn(
                  'p-1 rounded-xl transition-all',
                  isActive && 'bg-amber-400/15'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-amber-500 stroke-[2.5]')} />
              </div>
              <span className="text-[10px] leading-tight mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
      {/* Sticky Top Header with mobile-safe padding */}
      <header className="flex h-14 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur-md px-3 sm:px-6 sticky top-0 z-40 shadow-xs">
        <Link href="/home" prefetch={true} className="shrink-0 flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
          <ThemeToggle />
          <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full relative text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="sr-only">Toggle Notifications</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-2xl">
              <SheetHeader>
                <SheetTitle className="font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Notifications & Alerts
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Your ride updates, announcements, and safety alerts
                </SheetDescription>
              </SheetHeader>
              <NotificationsPanel />
            </SheetContent>
          </Sheet>
          <UserMenu />
        </div>
      </header>

      {/* Main Content with bottom padding for mobile bar */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav />

      {/* Desktop Footer */}
      <footer className="hidden md:block bg-muted/30 border-t">
        <div className="container mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Logo />
              <p className="text-xs text-muted-foreground leading-relaxed">
                मिथिला गाड़ी (Mithila Gaadi) — Bharat&apos;s fastest bike taxi, auto & parcel delivery app crafted for Mithilanchal.
              </p>
              <div className="flex gap-3 text-muted-foreground">
                <a href="#" className="hover:text-amber-500"><Facebook className="h-4 w-4" /></a>
                <a href="#" className="hover:text-amber-500"><Instagram className="h-4 w-4" /></a>
                <a href="#" className="hover:text-amber-500"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="hover:text-amber-500"><Linkedin className="h-4 w-4" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-foreground">Services</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/home" className="hover:text-amber-500">Bike Taxi (Fastest)</Link></li>
                <li><Link href="/home" className="hover:text-amber-500">Auto Rickshaw</Link></li>
                <li><Link href="/home" className="hover:text-amber-500">Cab Economy</Link></li>
                <li><Link href="/profile/parcel" className="hover:text-amber-500">Rapido Parcel Delivery</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-foreground">Captain & Earn</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/driver" className="hover:text-amber-500">Captain App</Link></li>
                <li><Link href="/driver/earnings" className="hover:text-amber-500">Daily Earnings</Link></li>
                <li><Link href="/profile/refer" className="hover:text-amber-500">Refer & Earn ₹500</Link></li>
                <li><Link href="/profile/power-pass" className="hover:text-amber-500">Power Pass Passes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-foreground">Support & Help</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/profile/help-center" className="hover:text-amber-500">24x7 Help Center</Link></li>
                <li><Link href="/profile/safety" className="hover:text-amber-500">Safety & Insurance</Link></li>
                <li><Link href="/terms" className="hover:text-amber-500">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-amber-500">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; {year || 2026} Mithila गाड़ी. All rights reserved.</p>
            <p>Made with ❤️ for Mithilanchal (Darbhanga, Madhubani, Samastipur)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

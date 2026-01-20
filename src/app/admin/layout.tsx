'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  Car,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800/80',
        isActive && 'bg-gray-800 text-white'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

function SidebarNav() {
    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink href="/admin" icon={LayoutDashboard}>
                Dashboard
            </NavLink>
            <NavLink href="/admin/users" icon={Users}>
                Manage Users
            </NavLink>
            <NavLink href="/admin/drivers" icon={Car}>
                Manage Drivers
            </NavLink>
            <NavLink href="/admin/rides" icon={Map}>
                Ride Monitoring
            </NavLink>
            <NavLink href="/admin/finance" icon={Wallet}>
                Finance
            </NavLink>
            <NavLink href="/admin/settings" icon={Settings}>
                Settings
            </NavLink>
        </nav>
    );
}

function UserMenu() {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        auth.signOut().then(() => {
          router.push("/");
        });
      };

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                        <AvatarFallback>
                            {user.displayName?.charAt(0) ?? user.email?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/home">Back to App</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface UserProfile {
    role?: 'passenger' | 'driver' | 'admin';
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [year, setYear] = useState<number | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = authLoading || profileLoading;
  
  useEffect(() => {
    // Only perform check after all loading is complete.
    if (!isLoading) {
      // If loading is done, and we determine the user is not an admin, redirect.
      if (!user || userProfile?.role !== 'admin') {
        router.replace('/home');
      }
    }
  }, [isLoading, user, userProfile, router]);
  
  useEffect(() => {
    // Set year on the client to avoid hydration mismatch
    setYear(new Date().getFullYear());
  }, []);


  // 1. While any authentication or profile fetching is in progress, show a loading screen.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <p className="text-muted-foreground">
            Verifying admin credentials...
          </p>
        </div>
      </div>
    );
  }

  // 2. After loading, if the user's role is confirmed to be an admin, render the dashboard.
  // This check is crucial to prevent non-admins from seeing a flash of the admin UI.
  if (userProfile?.role === 'admin') {
      return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="hidden border-r bg-gray-900 text-white md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b border-gray-800 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/home"><Logo /></Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <SidebarNav />
                </div>
            </div>
          </aside>
          <div className="flex flex-col">
            <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
              <div className='flex items-center gap-4'>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 md:hidden"
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col bg-gray-900 text-white p-0">
                      <div className="flex h-14 items-center border-b border-gray-800 px-4 lg:h-[60px] lg:px-6">
                          <Link href="/home"><Logo /></Link>
                      </div>
                      <div className="flex-1 overflow-auto py-2">
                          <SidebarNav />
                      </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              <div className="ml-auto">
                <UserMenu />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
            <footer className="border-t p-4 text-center text-xs text-muted-foreground">
                {year && `Copyright © MithilaCab ${year}`}
            </footer>
          </div>
        </div>
      );
  }
  
  // 3. If loading is done but the user is not an admin, render nothing.
  // The useEffect above has already initiated the redirect. This prevents the admin UI
  // from flashing on the screen for a non-admin user.
  return null;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Logo } from '@/components/logo';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Car,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  User,
  Users,
  Wallet,
  FileBadge,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function NavLink({
  href,
  icon: Icon,
  children,
  isCollapsed
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800/80',
        isActive && 'bg-gray-800 text-white',
        isCollapsed && 'justify-center'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn('truncate', isCollapsed && 'hidden')}>{children}</span>
    </Link>
  );
}

function SidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink href="/admin" icon={LayoutDashboard} isCollapsed={isCollapsed}>
                Dashboard
            </NavLink>
            <NavLink href="/admin/users" icon={Users} isCollapsed={isCollapsed}>
                Manage Users
            </NavLink>
            <NavLink href="/admin/drivers" icon={Car} isCollapsed={isCollapsed}>
                Manage Drivers
            </NavLink>
            <NavLink href="/admin/verification" icon={FileBadge} isCollapsed={isCollapsed}>
                Verification Queue
            </NavLink>
            <NavLink href="/admin/rides" icon={Map} isCollapsed={isCollapsed}>
                Ride Monitoring
            </NavLink>
            <NavLink href="/admin/finance" icon={Wallet} isCollapsed={isCollapsed}>
                Finance
            </NavLink>
            <NavLink href="/admin/settings" icon={Settings} isCollapsed={isCollapsed}>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be returned to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className={buttonVariants({ variant: "destructive" })}>Log Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = authLoading || profileLoading;
  
  useEffect(() => {
    if (!isLoading) {
      if (!user || userProfile?.role !== 'admin') {
        router.replace('/home');
      }
    }
  }, [isLoading, user, userProfile, router]);
  
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

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

  if (userProfile?.role === 'admin') {
      return (
        <div className={cn(
            "grid min-h-screen w-full transition-all duration-300",
            isCollapsed ? "md:grid-cols-[64px_1fr]" : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
        )}>
          <aside className="hidden border-r bg-gray-900 text-white md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className={cn("flex h-14 items-center border-b border-gray-800 px-4 lg:h-[60px] lg:px-6", isCollapsed && "justify-center")}>
                    <Link href="/home" className={cn(isCollapsed && 'w-min')}>
                        <Logo className={cn(isCollapsed && '[&>span]:hidden')} />
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <SidebarNav isCollapsed={isCollapsed} />
                </div>
                <div className="mt-auto p-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="w-full justify-center text-gray-400 hover:bg-gray-800/80 hover:text-white">
                      <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", isCollapsed && "rotate-180")} />
                      <span className="sr-only">Toggle Sidebar</span>
                  </Button>
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
                          <SidebarNav isCollapsed={false} />
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
  
  return null;
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Shield, Bell, Facebook, Instagram, MessageSquare } from "lucide-react";
import { useUser, useAuth, useDriver, useAdmin } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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


import { Logo } from "./logo";
import { Separator } from "./ui/separator";
import { NotificationsPanel } from "./notifications-panel";
import { ThemeToggle } from "./theme-toggle";

function UserMenu() {
    const { user } = useUser();
    const { isAdmin } = useAdmin();
    const auth = useAuth();
    const router = useRouter();
    const { driver, isDriverLoading } = useDriver();
    const pathname = usePathname();

    const handleLogout = () => {
        auth.signOut().then(() => {
          router.push("/login");
        });
    };

    const isDriverMode = pathname.startsWith('/driver');

    const handleRoleChange = (isDriverMode: boolean) => {
      router.push(isDriverMode ? '/driver' : '/home');
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
                            {user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName ?? 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email ?? 'No email'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile & Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isDriverLoading && driver && !isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <div className="flex items-center justify-between w-full cursor-pointer">
                                <Label htmlFor="driver-mode-switch" className="font-normal pr-4 cursor-pointer">Driver Mode</Label>
                                <Switch
                                    id="driver-mode-switch"
                                    checked={isDriverMode}
                                    onCheckedChange={handleRoleChange}
                                />
                            </div>
                        </DropdownMenuItem>
                    </>
                )}
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading: loading } = useUser();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6 sticky top-0 z-30">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4 ml-auto">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-7 w-7" />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6 sticky top-0 z-30">
            <Link href="/home">
                <Logo/>
            </Link>
            <div className="flex items-center gap-2 ml-auto">
              <ThemeToggle />
              <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell />
                    <span className="sr-only">Toggle Notifications</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                  </SheetHeader>
                  <NotificationsPanel />
                </SheetContent>
              </Sheet>
              <UserMenu />
            </div>
        </header>
        {children}
        <footer className="bg-muted/40 border-t">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Column 1: Logo & Socials */}
                    <div className="space-y-6">
                        <Logo />
                        <p className="text-sm text-muted-foreground">Connecting Mithila, one ride at a time. Safe, reliable, and culturally aware transportation.</p>
                        <div className="flex gap-4">
                            <a href="#"><Facebook className="text-muted-foreground hover:text-primary"/></a>
                            <a href="#"><Instagram className="text-muted-foreground hover:text-primary"/></a>
                            <a href="#"><MessageSquare className="text-muted-foreground hover:text-primary"/></a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/home" className="text-muted-foreground hover:text-primary">Home</Link></li>
                            <li><Link href="/history" className="text-muted-foreground hover:text-primary">My Rides</Link></li>
                            <li><Link href="/profile" className="text-muted-foreground hover:text-primary">Profile</Link></li>
                            <li><Link href="/signup?role=driver" className="text-muted-foreground hover:text-primary">Become a Driver</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/profile/safety" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
                            <li><Link href="/profile/faq" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
                            <li><Link href="/profile/safety" className="text-muted-foreground hover:text-primary">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {year} MithilaCab. All rights reserved.</p>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
}

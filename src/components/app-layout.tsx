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
import { User, LogOut, Shield, Bell } from "lucide-react";
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
      </div>
    </>
  );
}

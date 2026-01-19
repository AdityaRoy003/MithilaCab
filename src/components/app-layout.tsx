"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, History, User, LogOut, Shield } from "lucide-react";
import { useUser, useAuth, useDriver, useAdmin } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Logo } from "./logo";
import { Separator } from "./ui/separator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const { user, loading } = useUser();
  const { driver, isDriverLoading } = useDriver();
  const { isAdmin, isAdminLoading } = useAdmin();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push("/");
    });
  };

  const isDriverMode = pathname.startsWith('/driver');

  const handleRoleChange = (isDriverMode: boolean) => {
    router.push(isDriverMode ? '/driver' : '/home');
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="hidden md:flex flex-col justify-between w-64 border-r p-4">
          <div>
            <Skeleton className="h-10 w-40 mb-8" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-px w-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 sticky top-0 z-30 md:hidden -mx-6 -mt-8 mb-6">
               <Skeleton className="h-7 w-7" />
               <Skeleton className="h-6 w-24" />
            </div>
            {children}
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/home">
                  <Home />
                  <span>Book a Ride</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/history">
                  <History />
                  <span>Ride History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/profile">
                  <User />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {!isAdminLoading && isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin">
                    <Shield />
                    <span>Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="gap-4">
          <Separator />
          <div className="flex items-center gap-3 px-2">
            <Avatar>
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ""} />
              <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-semibold truncate">{user.displayName ?? 'User'}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
          </div>
          
          {!isDriverLoading && driver && (
            <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-sidebar-accent">
                <Label htmlFor="driver-mode" className="font-semibold cursor-pointer">Driver Mode</Label>
                <Switch
                    id="driver-mode"
                    checked={isDriverMode}
                    onCheckedChange={handleRoleChange}
                />
            </div>
          )}

          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 sticky top-0 z-30 md:hidden">
            <SidebarTrigger />
            <div className="flex-1">
                <span className="font-headline text-xl font-bold">MithilaCab</span>
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Home, History, User, LogOut } from "lucide-react";

import { Logo } from "./logo";
import { Separator } from "./ui/separator";
import { mockUser } from "@/lib/data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

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
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="gap-4">
          <Separator />
          <div className="flex items-center gap-3 px-2">
            <Avatar>
              <AvatarImage src={mockUser.image.imageUrl} alt={mockUser.name} data-ai-hint={mockUser.image.imageHint} />
              <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-semibold truncate">{mockUser.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{mockUser.email}</p>
            </div>
          </div>
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

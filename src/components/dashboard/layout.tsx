
'use client';

import type { ComponentType, ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChefHat,
  Settings,
  User,
  LogOut,
  BarChart,
  Users,
  Utensils,
  CircleDollarSign,
  CalendarDays,
  Bell,
  UserCheck,
  LifeBuoy
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';


const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  BarChart,
  Users,
  Utensils,
  CircleDollarSign,
  CalendarDays,
  Bell,
  UserCheck,
  Settings,
  LifeBuoy
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  user: { name: string; role: string; avatarUrl?: string };
}

export function DashboardLayout({ children, navItems, user }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ChefHat className="h-6 w-6" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h1 className="text-xl font-semibold">Messo</h1>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        {Icon && <Icon />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-center group-data-[collapsible=expanded]:justify-start group-data-[collapsible=expanded]:p-2 h-auto">
                    <div className="flex items-center gap-3 w-full">
                        <Avatar className="size-8">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                            <p className="font-semibold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                        </div>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                    <Link href={user.role === 'Mess Manager' ? '/admin/settings?tab=profile' : '/student'}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'Mess Manager' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/support">
                          <LifeBuoy className="mr-2 h-4 w-4" />
                          <span>Support</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="absolute inset-0 grid-bg -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="glow-effect-1 -z-10" />
        <div className="glow-effect-2 -z-10" />
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/50 px-6 backdrop-blur-lg">
          <SidebarTrigger />
           {user.role === 'Mess Manager' && (
             <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/announcements"><Bell /></Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Announcements</p>
                    </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/settings"><Settings /></Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Settings</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in-0 duration-500">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

'use client';

import type { ComponentType, ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
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
          <SidebarContent className="p-2 pt-4">
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
        </Sidebar>
        
        <div className="peer-data-[state=collapsed]:[--sidebar-ml:var(--sidebar-width-icon)] peer-data-[state=expanded]:[--sidebar-ml:var(--sidebar-width)] flex-1 flex flex-col transition-all duration-300 ease-in-out md:ml-[--sidebar-ml]">
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="hidden md:flex" />
                    <Link href={user.role === 'Mess Manager' ? '/admin' : '/student'} className="flex items-center gap-3 font-semibold text-lg">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <ChefHat className="h-6 w-6" />
                        </div>
                        <span className="hidden sm:inline-block">Messo</span>
                    </Link>
                </div>

                 <div className="flex items-center gap-2">
                    {user.role === 'Mess Manager' && (
                        <div className="hidden sm:flex items-center gap-2">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
                                </div>
                            </DropdownMenuLabel>
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
                     <SidebarTrigger className="md:hidden" />
                 </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
                <div className="absolute inset-0 grid-bg -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                <div className="glow-effect-1 -z-10" />
                <div className="glow-effect-2 -z-10" />
                <div className="animate-in fade-in-0 duration-500">
                    {children}
                </div>
            </main>
        </div>
    </SidebarProvider>
  );
}

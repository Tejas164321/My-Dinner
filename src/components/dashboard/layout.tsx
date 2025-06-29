'use client';

import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  LifeBuoy,
  PanelLeft,
} from 'lucide-react';

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
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  user: { name: string; role: string; email: string; avatarUrl?: string };
}

function NavContent({ navItems, isCollapsed, onLinkClick }: { navItems: NavItem[], isCollapsed: boolean, onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col items-start gap-2 px-2 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/student' && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn("w-full transition-colors duration-300", isCollapsed ? 'justify-center h-10' : 'justify-start h-10 gap-3 px-3')}
                  onClick={onLinkClick}
                >
                  <Link href={item.href}>
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    <span className={cn("truncate", isCollapsed && "sr-only")}>{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={5}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function DashboardLayout({ children, navItems, user }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleMobileNavClose = () => setIsMobileNavOpen(false);
  const userPage = user.role === 'Mess Manager' ? '/admin' : '/student';

  if (isMobile) {
    return (
       <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 z-30 backdrop-blur-sm">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-72 bg-background/80 backdrop-blur-sm border-r">
                 <div className="border-b p-4">
                  <Link href={userPage} className="flex items-center gap-3 text-lg font-semibold">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <span>Messo</span>
                  </Link>
                </div>
                <NavContent navItems={navItems} isCollapsed={false} onLinkClick={handleMobileNavClose} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={user.role === 'Mess Manager' ? '/admin/settings' : '/student'}><User className="mr-2" />Profile</Link></DropdownMenuItem>
                  {user.role === 'Mess Manager' && <DropdownMenuItem asChild><Link href="/admin/settings"><Settings className="mr-2" />Settings</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/"><LogOut className="mr-2" />Log Out</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
          </main>
       </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleToggle} className="hidden md:flex">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <Link href={userPage} className="flex items-center gap-3 text-lg font-semibold">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <span className={cn(isCollapsed && "hidden")}>Messo</span>
                </Link>
            </div>
          
            <div className="flex items-center gap-2">
                {user.role === 'Mess Manager' && 
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild><Link href="/admin/announcements"><Bell /></Link></Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Announcements</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild><Link href="/admin/settings"><Settings /></Link></Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Settings</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                }
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href={user.role === 'Mess Manager' ? '/admin/settings' : '/student'}><User className="mr-2" />Profile</Link></DropdownMenuItem>
                    {user.role === 'Mess Manager' && <DropdownMenuItem asChild><Link href="/admin/settings"><Settings className="mr-2" />Settings</Link></DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/"><LogOut className="mr-2" />Log Out</Link></DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
            <aside className={cn(
                "hidden md:flex flex-col border-r bg-background/60 backdrop-blur-xl transition-[width] duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-64"
            )}>
                <div className="flex-grow">
                  <NavContent navItems={navItems} isCollapsed={isCollapsed} />
                </div>
                <div className="mt-auto border-t p-2">
                {user.role === 'Mess Manager' && (
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button asChild variant={'ghost'} className={cn("w-full transition-colors duration-300", isCollapsed ? 'justify-center h-10' : 'justify-start h-10 gap-3 px-3')}>
                            <Link href={'/admin/support'}>
                            <LifeBuoy className="h-5 w-5 shrink-0" />
                            <span className={cn("truncate", isCollapsed && "sr-only")}>Support</span>
                            </Link>
                        </Button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right" sideOffset={5}>Support</TooltipContent>}
                    </Tooltip>
                    </TooltipProvider>
                )}
                </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}

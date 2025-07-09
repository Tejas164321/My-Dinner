
'use client';

import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
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
  ChevronsLeft,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';


const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart,
  Users,
  Utensils,
  CircleDollarSign,
  CalendarDays,
  Bell,
  UserCheck,
  LifeBuoy,
  MessageSquare,
  Settings,
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
  onLogout: () => Promise<void>;
}

function NavContent({ navItems, isCollapsed, onLinkClick }: { navItems: NavItem[], isCollapsed: boolean, onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex flex-col items-start gap-3 px-2 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/student/dashboard' && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn("w-full transition-colors duration-300 overflow-hidden", isCollapsed ? 'justify-center h-10' : 'justify-start h-10 gap-3 px-3')}
                  onClick={onLinkClick}
                >
                  <Link href={item.href}>
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    <span className={cn("whitespace-nowrap transition-all duration-200", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>{item.label}</span>
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

function UserProfileLink({ user, isCollapsed, onLinkClick }: { user: DashboardLayoutProps['user'], isCollapsed?: boolean, onLinkClick?: () => void }) {
    const profileLink = user.role === 'Mess Manager' ? '/admin/settings' : '/student/settings';
    
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Link 
                        href={profileLink} 
                        className={cn("flex items-center gap-3 w-full h-auto transition-colors duration-300 rounded-lg hover:bg-accent p-2 overflow-hidden", isCollapsed ? 'justify-center' : 'justify-start')}
                        onClick={onLinkClick}
                    >
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={cn("flex flex-col w-full min-w-0 transition-all duration-200 overflow-hidden", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            <p className="font-semibold text-sm truncate whitespace-nowrap">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate whitespace-nowrap">{user.role}</p>
                        </div>
                    </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right" sideOffset={5}>{user.name}</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    )
}

function LogoutButton({ isCollapsed, onLogout, onLinkClick }: { isCollapsed?: boolean, onLogout: () => Promise<void>, onLinkClick?: () => void }) {
    const handleLogout = async () => {
        if (onLinkClick) onLinkClick();
        await onLogout();
        // The redirection is now handled by the parent layout's useEffect hook.
    }

     return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleLogout} variant="ghost" className={cn("w-full transition-colors duration-300 overflow-hidden", isCollapsed ? 'justify-center h-10' : 'justify-start h-10 gap-3 px-3')}>
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className={cn("whitespace-nowrap transition-all duration-200", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Log Out</span>
                    </Button>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent side="right" sideOffset={5}>
                    Log Out
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
     )
}

export function DashboardLayout({ children, navItems, user, onLogout }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleMobileNavClose = () => setIsMobileNavOpen(false);

  const dashboardPath = user.role === 'Mess Manager' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <div className="flex h-screen w-full bg-background">
      {/* --- Desktop Sidebar --- */}
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-card/80 backdrop-blur-xl transition-[width] duration-500 ease-in-out relative",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn("flex items-center border-b overflow-hidden", isCollapsed ? 'h-16 justify-center' : 'h-16 justify-between px-4')}>
          <Link href={dashboardPath} className="flex items-center gap-3 text-lg font-semibold">
            <div className={cn("rounded-lg bg-primary/10 p-2.5 text-primary shrink-0", isCollapsed && "p-2")}>
              <ChefHat className={cn("h-6 w-6", isCollapsed && "h-5 w-5")} />
            </div>
            <span className={cn("font-bold whitespace-nowrap transition-all duration-200", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Messo</span>
          </Link>
        </div>
        <div className={cn("border-b", isCollapsed ? 'p-1' : 'p-2')}>
          <UserProfileLink user={user} isCollapsed={isCollapsed} />
        </div>
        <div className="flex-grow overflow-y-auto">
          <NavContent navItems={navItems} isCollapsed={isCollapsed} />
        </div>
        <div className="mt-auto border-t p-2">
           <LogoutButton isCollapsed={isCollapsed} onLogout={onLogout} />
        </div>
        <button
          onClick={handleToggle}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 flex h-12 w-6 cursor-pointer items-center justify-center rounded-sm border bg-secondary/80 text-muted-foreground/80 backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
        </button>
      </aside>
      
      {/* --- Mobile Header & Main Content --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 z-30 backdrop-blur-sm md:hidden">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64 bg-card/80 backdrop-blur-sm border-r">
                <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                  <Link href={dashboardPath} className="flex items-center gap-3 text-lg font-semibold" onClick={handleMobileNavClose}>
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <span className="font-bold">Messo</span>
                  </Link>
                </div>
                <div className="border-b p-2">
                    <UserProfileLink user={user} isCollapsed={false} onLinkClick={handleMobileNavClose} />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <NavContent navItems={navItems} isCollapsed={false} onLinkClick={handleMobileNavClose} />
                </div>
                <div className="mt-auto border-t p-2">
                    <LogoutButton isCollapsed={false} onLogout={onLogout} onLinkClick={handleMobileNavClose} />
                </div>
            </SheetContent>
          </Sheet>

          <Link href={dashboardPath} className="flex items-center gap-3 text-lg font-semibold">
            <span className="font-bold">Dashboard</span>
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}

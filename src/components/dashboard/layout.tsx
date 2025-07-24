
'use client';

import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
  LayoutDashboard,
  Megaphone,
} from 'lucide-react';


const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart,
  Users,
  Utensils,
  CircleDollarSign,
  CalendarDays,
  Bell,
  Megaphone,
  UserCheck,
  LifeBuoy,
  MessageSquare,
  Settings,
  LogOut,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  user: { name: string; role: 'admin' | 'student'; email: string; avatarUrl?: string };
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

function BottomNav({ navItems, onLinkClick }: { navItems: NavItem[]; onLinkClick?: () => void }) {
  const pathname = usePathname();
  // Display the first 5 items, or a curated list if needed
  const mainNavItems = navItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card/95 backdrop-blur-sm md:hidden">
      {mainNavItems.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/student/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors",
              isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent/50"
            )}
            onClick={onLinkClick}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


function UserProfileLink({ user, isCollapsed, onLinkClick }: { user: DashboardLayoutProps['user'], isCollapsed?: boolean, onLinkClick?: () => void }) {
    const profileLink = user.role === 'admin' ? '/admin/settings' : '/student/settings';
    const roleName = user.role === 'admin' ? 'Admin' : 'Student';
    
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
                            <p className="text-xs text-muted-foreground truncate whitespace-nowrap capitalize">{roleName}</p>
                        </div>
                    </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right" sideOffset={5}>{user.name}</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    )
}

function LogoutButton({ isCollapsed, onLinkClick }: { isCollapsed?: boolean, onLinkClick?: () => void }) {
    const handleLogout = async () => {
        if (onLinkClick) onLinkClick();
        await signOut(auth);
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

export function DashboardLayout({ children, navItems, user }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  const settingsPath = user.role === 'admin' ? '/admin/settings' : '/student/settings';
  
  const handleLogout = async () => {
      await signOut(auth);
      // The redirection is now handled by the parent layout's useEffect hook.
  }

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
           <LogoutButton isCollapsed={isCollapsed} />
        </div>
        <button
          onClick={handleToggle}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 hidden h-12 w-6 cursor-pointer items-center justify-center rounded-sm border bg-secondary/80 text-muted-foreground/80 backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground md:flex"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
        </button>
      </aside>
      
      {/* --- Mobile Header & Main Content --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 z-30 backdrop-blur-sm md:hidden">
            <Link href={dashboardPath} className="flex items-center gap-2 text-lg font-semibold">
                <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                    <ChefHat className="h-5 w-5" />
                </div>
                <span className="font-bold">Messo</span>
            </Link>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                           <AvatarImage src={user.avatarUrl} alt={user.name} />
                           <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                      <Link href={settingsPath}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile & Settings</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                       <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:p-8 md:pb-8">
            {children}
        </main>
        <BottomNav navItems={navItems} />
      </div>
    </div>
  );
}

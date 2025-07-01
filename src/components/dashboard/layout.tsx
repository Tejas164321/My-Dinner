
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
  ChevronsLeft,
  MessageSquare
} from 'lucide-react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  BarChart,
  Users,
  Utensils,
  CircleDollarSign,
  CalendarDays,
  Bell,
  UserCheck,
  LifeBuoy,
  User,
  MessageSquare
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
    <TooltipProvider delayDuration={300}>
      <nav className="flex flex-col items-start gap-3 px-4 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/student' && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
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

function UserProfile({ user, isCollapsed }: { user: DashboardLayoutProps['user'], isCollapsed?: boolean }) {
    const profileLink = user.role === 'Mess Manager' ? '/admin/settings' : '/student/settings';
    
    return (
        <DropdownMenu>
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={cn("w-full h-auto transition-colors duration-300", isCollapsed ? 'justify-center p-2' : 'justify-start p-2 gap-3')}>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className={cn("text-left", isCollapsed === true ? "sr-only" : "w-full")}>
                                    <p className="font-semibold text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right" sideOffset={5}>{user.name}</TooltipContent>}
                </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent align="start" side={isCollapsed ? "right" : "bottom"} sideOffset={10} className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={profileLink}><User className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                {user.role === 'Mess Manager' && 
                    <DropdownMenuItem asChild><Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                }
                 {user.role === 'Mess Manager' ? (
                     <DropdownMenuItem asChild><Link href="/admin/announcements"><Bell className="mr-2 h-4 w-4"/>Announcements</Link></DropdownMenuItem>
                 ) : (
                      <DropdownMenuItem asChild><Link href="/student/notifications"><Bell className="mr-2 h-4 w-4"/>Notifications</Link></DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/" className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Log Out
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function DashboardLayout({ children, navItems, user }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleMobileNavClose = () => setIsMobileNavOpen(false);

  if (isMobile) {
    return (
       <div className="flex min-h-screen w-full flex-col bg-background">
          <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 z-30 backdrop-blur-sm">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-64 bg-card/80 backdrop-blur-sm border-r">
                <SheetHeader className="sr-only">
                  <SheetTitle>Main Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through the application sections.
                  </SheetDescription>
                </SheetHeader>
                 <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                  <Link href={user.role === 'Mess Manager' ? '/admin' : '/student'} className="flex items-center gap-3 text-lg font-semibold">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <span className="font-bold">Messo</span>
                  </Link>
                </div>
                <div className="border-b p-2">
                    <UserProfile user={user} isCollapsed={false} />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <NavContent navItems={navItems} isCollapsed={false} onLinkClick={handleMobileNavClose} />
                </div>
              </SheetContent>
            </Sheet>

            <Link href={user.role === 'Mess Manager' ? '/admin' : '/student'} className="flex items-center gap-3 text-lg font-semibold">
                <span className="font-bold">Dashboard</span>
            </Link>
            
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
          </main>
       </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background">
        <aside className={cn(
            "hidden md:flex flex-col border-r bg-card/80 backdrop-blur-xl transition-[width] duration-500 ease-in-out relative",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className={cn("flex items-center border-b", isCollapsed ? 'h-16 justify-center' : 'h-16 justify-between px-4')}>
                <Link href={user.role === 'Mess Manager' ? '/admin' : '/student'} className="flex items-center gap-3 text-lg font-semibold">
                    <div className={cn("rounded-lg bg-primary/10 p-2.5 text-primary", isCollapsed && "p-2")}>
                        <ChefHat className={cn("h-6 w-6", isCollapsed && "h-5 w-5")} />
                    </div>
                    <span className={cn("font-bold", isCollapsed && "sr-only")}>Messo</span>
                </Link>
            </div>
             <div className={cn("border-b", isCollapsed ? 'p-2' : 'p-2')}>
                <UserProfile user={user} isCollapsed={isCollapsed} />
            </div>
            <div className="flex-grow overflow-y-auto">
                <NavContent navItems={navItems} isCollapsed={isCollapsed} />
            </div>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "absolute top-1/2 -translate-y-1/2 -right-3 z-10 flex h-12 w-6 cursor-pointer items-center justify-center rounded-sm border bg-secondary/80 text-muted-foreground/80 backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                            <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        {isCollapsed ? "Expand" : "Collapse"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </aside>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </main>
    </div>
  );
}

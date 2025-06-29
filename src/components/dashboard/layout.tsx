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

function NavContent({ navItems, isCollapsed, user, onLinkClick }: { navItems: NavItem[], isCollapsed: boolean, user: DashboardLayoutProps['user'], onLinkClick?: () => void }) {
  const pathname = usePathname();
  const userPage = user.role === 'Mess Manager' ? '/admin' : '/student';

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center p-4", isCollapsed ? 'justify-center' : 'justify-between')}>
        <Link href={userPage} className={cn("flex items-center gap-3 font-semibold text-lg", isCollapsed && "hidden")}>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ChefHat className="h-6 w-6" />
          </div>
          <span>Messo</span>
        </Link>
        <Link href={userPage} className={cn("items-center gap-3 font-semibold text-lg hidden", isCollapsed && "flex")}>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ChefHat className="h-6 w-6" />
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname.startsWith(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn("w-full justify-start", isCollapsed && "justify-center w-auto h-12")}
                    onClick={onLinkClick}
                  >
                    <Link href={item.href}>
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className={cn("ml-4", isCollapsed && "hidden")}>{item.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="mt-auto border-t p-4">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-start p-2 h-auto", isCollapsed && "justify-center p-0")}>
                  <div className="flex items-center gap-3">
                     <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col items-start", isCollapsed && "hidden")}>
                      <span className="font-semibold text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role}</span>
                    </div>
                  </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={isCollapsed ? "right" : "top"} className="w-56 mb-2">
              <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
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
      </div>
    </div>
  );
}


export function DashboardLayout({ children, navItems, user }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleMobileNavClose = () => setIsMobileNavOpen(false);

  if (isMobile) {
    return (
       <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 z-30 backdrop-blur-sm">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-64">
                <NavContent navItems={navItems} isCollapsed={false} user={user} onLinkClick={handleMobileNavClose} />
              </SheetContent>
            </Sheet>
            <div className="flex w-full items-center justify-end gap-4">
              {user.role === 'Mess Manager' && (
                <>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/announcements"><Bell className="h-5 w-5"/></Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/settings"><Settings className="h-5 w-5"/></Link>
                  </Button>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
              <div className="absolute inset-0 grid-bg -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
              <div className="glow-effect-1 -z-10" />
              <div className="glow-effect-2 -z-10" />
              {children}
          </main>
       </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 hidden h-full border-r bg-background transition-all duration-300 md:flex",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <NavContent navItems={navItems} isCollapsed={isCollapsed} user={user} />
      </aside>
      <div className={cn(
        "flex flex-col transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <Button variant="ghost" size="icon" onClick={handleToggle} className="hidden md:flex">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
           {/* Mobile menu button will be here, but hidden on desktop */}
          <div className="md:hidden">
            <Link href={user.role === 'Mess Manager' ? '/admin' : '/student'} className="flex items-center gap-3 font-semibold text-lg">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ChefHat className="h-6 w-6" />
              </div>
              <span>Messo</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'Mess Manager' && (
              <div className="hidden sm:flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/announcements"><Bell className="h-5 w-5"/></Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Announcements</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/settings"><Settings className="h-5 w-5"/></Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 grid-bg -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="glow-effect-1 -z-10" />
          <div className="glow-effect-2 -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}

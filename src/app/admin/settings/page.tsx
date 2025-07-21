
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Bell, Info, Moon, Sun, RefreshCw, Copy, User, CalendarClock, HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { messInfo } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

function SettingsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user: adminUser, loading } = useAuth();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
     const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Profile Settings State
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [secretCode, setSecretCode] = useState('1234');

    // General Settings State
    const [messName, setMessName] = useState(messInfo.name);
    const [contactEmail, setContactEmail] = useState(messInfo.email);
    const [contactPhone, setContactPhone] = useState(messInfo.phone);
    const [address, setAddress] = useState(messInfo.address);
    const [joinRequestApproval, setJoinRequestApproval] = useState<'manual' | 'auto'>('manual');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Leave Deadline Settings
    const [leaveDeadlineEnabled, setLeaveDeadlineEnabled] = useState(true);
    const [lunchDeadline, setLunchDeadline] = useState('10:00');
    const [dinnerDeadline, setDinnerDeadline] = useState('18:00');

    const [uniqueSuffix, setUniqueSuffix] = useState('');
    
    useEffect(() => {
        if (adminUser) {
            setProfileName(adminUser.name || '');
            setProfileEmail(adminUser.email || '');
        }
    }, [adminUser]);

    useEffect(() => {
        // This will only run on the client, after initial hydration
        setUniqueSuffix(Math.floor(1000 + Math.random() * 9000).toString());
    }, []);

    const messUniqueId = useMemo(() => {
        if (!uniqueSuffix) return '';
        const slugBase = messName
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        const slug = slugBase.substring(0, 10);
        return `${slug}-${uniqueSuffix}`;
    }, [messName, uniqueSuffix]);

    // Billing Settings State
    const [perMealCharge, setPerMealCharge] = useState('65.00');

    const lunchTimeOptions = [
        { value: '09:00', label: '09:00 AM' },
        { value: '09:30', label: '09:30 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '10:30', label: '10:30 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '11:30', label: '11:30 AM' },
    ];

    const dinnerTimeOptions = [
        { value: '17:00', label: '05:00 PM' },
        { value: '17:30', label: '05:30 PM' },
        { value: '18:00', label: '06:00 PM' },
        { value: '18:30', label: '06:30 PM' },
        { value: '19:00', label: '07:00 PM' },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleRegenerateCode = () => {
        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
        setSecretCode(newCode);
        toast({
            title: "Code Regenerated",
            description: `The new mess secret code is ${newCode}.`,
        })
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(secretCode);
        toast({
            title: "Copied to clipboard!",
            description: `The code "${secretCode}" has been copied.`,
        });
    };

    const handleCopyUniqueId = () => {
        navigator.clipboard.writeText(messUniqueId);
        toast({
            title: "Copied to clipboard!",
            description: `The unique ID "${messUniqueId}" has been copied.`,
        });
    };
    
    if (loading || !adminUser) {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in-0">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="mt-6 h-[700px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Link href="/admin/support" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Support</span>
                    </Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="general"><Info className="mr-2 h-4 w-4" /> General</TabsTrigger>
                    <TabsTrigger value="billing"><DollarSign className="mr-2 h-4 w-4" /> Billing</TabsTrigger>
                    <TabsTrigger value="leave"><CalendarClock className="mr-2 h-4 w-4" /> Leave</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Update your personal information and manage your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <Avatar className="w-24 h-24 border-4 border-primary/20">
                                    <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                                    <AvatarFallback>{adminUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 text-center sm:text-left">
                                    <h3 className="text-2xl font-semibold">{profileName}</h3>
                                    <p className="text-muted-foreground">{adminUser.role}</p>
                                    <Button variant="outline">Upload New Photo</Button>
                                </div>
                            </div>
                            
                             <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-semibold text-foreground/90">Mess Identifiers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4 rounded-lg border p-4 bg-secondary/50">
                                        <div className="space-y-1">
                                            <h3 className="font-medium">Mess Secret Code</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Students use this 4-digit code to join.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    id="secret-code"
                                                    value={secretCode}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*$/.test(value) && value.length <= 4) {
                                                            setSecretCode(value);
                                                        }
                                                    }}
                                                    maxLength={4}
                                                    className="font-mono text-lg tracking-widest text-center"
                                                />
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" onClick={handleRegenerateCode}><RefreshCw className="h-4 w-4" /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Regenerate Code</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" onClick={handleCopyCode}><Copy className="h-4 w-4" /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Copy Code</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                    <div className="space-y-4 rounded-lg border p-4 bg-secondary/50">
                                        <div className="space-y-1">
                                            <h3 className="font-medium">Mess Unique ID</h3>
                                            <p className="text-sm text-muted-foreground">
                                                A unique ID for students to find your mess.
                                            </p>
                                        </div>
                                         <div className="relative">
                                            <Input id="mess-id" value={messUniqueId} readOnly className="pr-10 font-mono bg-muted/50" />
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={handleCopyUniqueId} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Copy Unique ID</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-semibold text-foreground/90">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name">Full Name</Label>
                                        <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-email">Email Address</Label>
                                        <Input id="profile-email" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-semibold text-foreground/90">Change Password</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" placeholder="••••••••" />
                                    </div>
                                    <div></div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Update Profile</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Update basic details and core operational settings for your mess.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="font-medium">Mess Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="mess-name">Mess Name</Label>
                                        <Input id="mess-name" value={messName} onChange={(e) => setMessName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-email">Contact Email</Label>
                                        <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-phone">Contact Phone</Label>
                                        <Input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="min-h-[80px]" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Student Join Requests</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Choose how to handle requests from new students.
                                    </p>
                                </div>
                                <RadioGroup
                                    value={joinRequestApproval}
                                    onValueChange={(value: 'manual' | 'auto') => setJoinRequestApproval(value)}
                                    className="space-y-2"
                                >
                                    <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="manual" id="manual" />
                                        <div className="grid gap-1.5 leading-none">
                                            <div className="font-normal">
                                                Manual Approval
                                                <p className="text-sm text-muted-foreground">
                                                    Admin must manually approve each new student join request. (Recommended)
                                                </p>
                                            </div>
                                        </div>
                                    </Label>
                                    <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="auto" id="auto" />
                                        <div className="grid gap-1.5 leading-none">
                                            <div className="font-normal">
                                                Automatic Approval
                                                <p className="text-sm text-muted-foreground">
                                                    Automatically approve all new join requests. Use with caution.
                                                </p>
                                            </div>
                                        </div>
                                    </Label>
                                </RadioGroup>
                            </div>

                             <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-medium">Notification Settings</h3>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notif-master" className="text-base">Enable In-App Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Master control for dashboard notifications and alerts.</p>
                                    </div>
                                    <Switch id="notif-master" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Financials</CardTitle>
                            <CardDescription>Configure rates and billing parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="per-meal-charge">Per Meal Charge (INR)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="per-meal-charge" type="number" placeholder="65.00" value={perMealCharge} onChange={(e) => setPerMealCharge(e.target.value)} className="pl-8" />
                                </div>
                                <p className="text-xs text-muted-foreground">The base rate charged per student for a single meal (lunch or dinner).</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="leave" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Settings</CardTitle>
                            <CardDescription>Configure rules and deadlines for student leave applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4 pt-6">
                                <h3 className="font-medium">Leave Application Deadlines</h3>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="leave-deadline-enabled" className="text-base">Enforce Leave Deadlines</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Set cutoff times for students to apply for meal leaves.
                                        </p>
                                    </div>
                                    <Switch 
                                        id="leave-deadline-enabled" 
                                        checked={leaveDeadlineEnabled} 
                                        onCheckedChange={setLeaveDeadlineEnabled} 
                                    />
                                </div>
                                {leaveDeadlineEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 pt-4 border-l-2 border-primary/20 ml-6 animate-in fade-in-0 duration-300">
                                        <div className="space-y-2">
                                            <Label htmlFor="lunch-deadline">Lunch Leave Deadline</Label>
                                            <Select value={lunchDeadline} onValueChange={setLunchDeadline}>
                                                <SelectTrigger id="lunch-deadline">
                                                    <SelectValue placeholder="Select a time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {lunchTimeOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dinner-deadline">Dinner Leave Deadline</Label>
                                            <Select value={dinnerDeadline} onValueChange={setDinnerDeadline}>
                                                <SelectTrigger id="dinner-deadline">
                                                    <SelectValue placeholder="Select a time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dinnerTimeOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


export default function SettingsPage() {
    return (
        <SettingsPageContent />
    );
}

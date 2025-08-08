

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Bell, Info, Moon, Sun, RefreshCw, Copy, User, CalendarClock, HelpCircle, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getMessInfo, updateMessInfo, type MessInfo } from '@/lib/services/mess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const settingsNav = [
  { title: "Profile", href: "profile", icon: User },
  { title: "General", href: "general", icon: Info },
  { title: "Billing", href: "billing", icon: DollarSign },
  { title: "Leave Rules", href: "leave", icon: CalendarClock },
];

function SettingsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user: adminUser, authLoading } = useAuth();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMessInfo, setIsLoadingMessInfo] = useState(true);

    const activeTab = useMemo(() => searchParams.get('tab') || 'profile', [searchParams]);

    // Profile Settings State
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [secretCode, setSecretCode] = useState('');

    // General Settings State
    const [messName, setMessName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [joinRequestApproval, setJoinRequestApproval] = useState<'manual' | 'auto'>('manual');

    // Leave Deadline Settings
    const [leaveDeadlineEnabled, setLeaveDeadlineEnabled] = useState(true);
    const [lunchDeadline, setLunchDeadline] = useState('10:00');
    const [dinnerDeadline, setDinnerDeadline] = useState('18:00');

    // Billing Settings State
    const [perMealCharge, setPerMealCharge] = useState('65');

    useEffect(() => {
        if (adminUser) {
            setProfileName(adminUser.name || '');
            setProfileEmail(adminUser.email || '');
            setSecretCode(adminUser.secretCode || '****');
            
            const fetchMessData = async () => {
                setIsLoadingMessInfo(true);
                const messData = await getMessInfo(adminUser.uid);
                if (messData) {
                    setMessName(messData.messName || '');
                    setContactEmail(messData.contactEmail || '');
                    setContactPhone(messData.contactPhone || '');
                    setAddress(messData.address || '');
                    setPerMealCharge(messData.perMealCharge?.toString() || '65');
                    setJoinRequestApproval(messData.joinRequestApproval || 'manual');
                }
                setIsLoadingMessInfo(false);
            };
            fetchMessData();
        }
    }, [adminUser]);

    const messUniqueId = useMemo(() => {
        if (!adminUser?.uid) return 'loading...';
        const slugBase = (messName || 'mess')
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        const slug = slugBase.substring(0, 10);
        const uidSuffix = adminUser.uid.slice(0, 4);
        return `${slug}-${uidSuffix}`;
    }, [messName, adminUser]);

    const lunchTimeOptions = [
        { value: '09:00', label: '09:00 AM' }, { value: '09:30', label: '09:30 AM' },
        { value: '10:00', label: '10:00 AM' }, { value: '10:30', label: '10:30 AM' },
        { value: '11:00', label: '11:00 AM' }, { value: '11:30', label: '11:30 AM' },
    ];

    const dinnerTimeOptions = [
        { value: '17:00', label: '05:00 PM' }, { value: '17:30', label: '05:30 PM' },
        { value: '18:00', label: '06:00 PM' }, { value: '18:30', label: '06:30 PM' },
        { value: '19:00', label: '07:00 PM' },
    ];
    
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
            description: `The ${label} "${text}" has been copied.`,
        });
    };
    
    const handleSaveChanges = async () => {
        if (!adminUser) return;
        setIsSaving(true);
        try {
            let dataToUpdate: Partial<MessInfo> = {};
            if (activeTab === 'general') {
                dataToUpdate = { messName, contactEmail, contactPhone, address, joinRequestApproval };
            } else if (activeTab === 'billing') {
                const charge = parseFloat(perMealCharge);
                if (isNaN(charge) || charge < 0) {
                    toast({ variant: 'destructive', title: 'Invalid Price', description: 'Per meal charge must be a positive number.' });
                    setIsSaving(false);
                    return;
                }
                dataToUpdate = { perMealCharge: charge };
            }
             
            await updateMessInfo(adminUser.uid, dataToUpdate);
            toast({ title: 'Success', description: 'Your changes have been saved.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (authLoading || !adminUser) {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in-0">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    const ProfileContent = () => (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your personal information and manage your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="flex flex-row items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                        <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                        <AvatarFallback>{adminUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 text-left">
                        <h3 className="text-2xl font-semibold">{profileName}</h3>
                        <p className="text-muted-foreground capitalize">{adminUser.role}</p>
                        <Button variant="outline">Upload New Photo</Button>
                    </div>
                </div>
                
                 <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-foreground/90">Mess Identifiers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4 rounded-lg border p-4 bg-secondary/50">
                            <div className="space-y-1">
                                <h3 className="font-medium">Mess Secret Code</h3>
                                <p className="text-sm text-muted-foreground">
                                    Students use this 4-digit code to join.
                                </p>
                            </div>
                            <div className="relative">
                                <Input
                                    id="secret-code"
                                    value={secretCode}
                                    readOnly
                                    className="font-mono text-lg tracking-widest text-center pr-10"
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(secretCode, 'secret code')} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                    <Copy className="h-4 w-4" />
                                </Button>
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
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(messUniqueId, 'unique ID')} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-foreground/90">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="profile-name">Full Name</Label>
                            <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-email">Email Address</Label>
                            <Input id="profile-email" type="email" value={profileEmail} disabled />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-foreground/90">Change Password</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <Button disabled>Update Profile</Button>
            </CardFooter>
        </Card>
    );
    
    const GeneralContent = () => (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Update basic details and core operational settings for your mess.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {isLoadingMessInfo ? <Skeleton className="h-64 w-full" /> : (
                    <>
                    <div className="space-y-4">
                        <h3 className="font-medium">Mess Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2 sm:col-span-2">
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
                                <div>
                                    <p className="font-normal">Manual Approval</p>
                                    <p className="text-sm text-muted-foreground">
                                        Admin must manually approve each new student join request. (Recommended)
                                    </p>
                                </div>
                            </Label>
                            <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary">
                                <RadioGroupItem value="auto" id="auto" />
                                <div>
                                    <p className="font-normal">Automatic Approval</p>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically approve all new join requests. Use with caution.
                                    </p>
                                </div>
                            </Label>
                        </RadioGroup>
                    </div>
                    </>
                 )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingMessInfo}>
                    {isSaving ? <Loader2 className="animate-spin" /> : null}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );

    const BillingContent = () => (
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
                        <Input id="per-meal-charge" type="number" placeholder="65" value={perMealCharge} onChange={(e) => setPerMealCharge(e.target.value)} className="pl-8" />
                    </div>
                    <p className="text-xs text-muted-foreground">The base rate charged per student for a single meal (lunch or dinner).</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>
    );
    
    const LeaveContent = () => (
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-4 pt-4 border-l-2 border-primary/20 ml-6 animate-in fade-in-0 duration-300">
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
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                    {settingsNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <TabsTrigger key={item.href} value={item.href} className="flex-col sm:flex-row gap-2 py-2">
                                <Icon className="h-4 w-4"/> {item.title}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
                
                <TabsContent value="profile" className="mt-6"><ProfileContent /></TabsContent>
                <TabsContent value="general" className="mt-6"><GeneralContent /></TabsContent>
                <TabsContent value="billing" className="mt-6"><BillingContent /></TabsContent>
                <TabsContent value="leave" className="mt-6"><LeaveContent /></TabsContent>
            </Tabs>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <SettingsPageContent />
    );
}

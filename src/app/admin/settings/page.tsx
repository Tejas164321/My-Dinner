

'use client';

import { useState, useMemo, useEffect, type FC, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Bell, Info, Moon, Sun, Copy, User, CalendarClock, Loader2, IndianRupee } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getMessInfo, updateMessInfo, type MessInfo } from '@/lib/services/mess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NextLink from 'next/link';

const settingsNav = [
  { title: "Profile", href: "profile", icon: User },
  { title: "General", href: "general", icon: Info },
  { title: "Billing", href: "billing", icon: DollarSign },
  { title: "Leave Rules", href: "leave", icon: CalendarClock },
];

const ProfileContent: FC<any> = ({ adminUser, editableSettings, handleSettingChange, handleSaveChanges, isSaving }) => {
    const { toast } = useToast();
    const messUniqueId = useMemo(() => {
        if (!adminUser?.uid) return 'loading...';
        const slugBase = (editableSettings.messName || 'mess')
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        const slug = slugBase.substring(0, 10);
        const uidSuffix = adminUser.uid.slice(0, 4);
        return `${slug}-${uidSuffix}`;
    }, [editableSettings.messName, adminUser]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
            description: `The ${label} "${text}" has been copied.`,
        });
    };

    return (
    <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your personal information and manage your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                    <AvatarFallback>{adminUser.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-left">
                    <h3 className="text-2xl font-semibold">{editableSettings.profileName}</h3>
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
                                value={editableSettings.secretCode}
                                onChange={(e) => handleSettingChange('secretCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                className="font-mono text-lg tracking-widest text-center"
                            />
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
                        <Input id="profile-name" value={editableSettings.profileName} onChange={(e) => handleSettingChange('profileName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profile-email">Email Address</Label>
                        <Input id="profile-email" type="email" value={adminUser.email} disabled />
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
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </CardFooter>
    </Card>
)};

const GeneralContent: FC<any> = ({ isLoadingMessInfo, editableSettings, handleSettingChange, handleSaveChanges, isSaving }) => (
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
                            <Input id="mess-name" value={editableSettings.messName} onChange={(e) => handleSettingChange('messName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-email">Contact Email</Label>
                            <Input id="contact-email" type="email" value={editableSettings.contactEmail} onChange={(e) => handleSettingChange('contactEmail', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-phone">Contact Phone</Label>
                            <Input id="contact-phone" type="tel" value={editableSettings.contactPhone} onChange={(e) => handleSettingChange('contactPhone', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={editableSettings.address} onChange={(e) => handleSettingChange('address', e.target.value)} className="min-h-[80px]" />
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
                        value={editableSettings.joinRequestApproval}
                        onValueChange={(value: 'manual' | 'auto') => handleSettingChange('joinRequestApproval', value)}
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

const BillingContent: FC<any> = ({ editableSettings, handleSettingChange, handleSaveChanges, isSaving }) => (
    <Card>
        <CardHeader>
            <CardTitle>Billing & Financials</CardTitle>
            <CardDescription>Configure rates and billing parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="per-meal-charge">Per Meal Charge (INR)</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="per-meal-charge" type="number" placeholder="65" value={editableSettings.perMealCharge} onChange={(e) => handleSettingChange('perMealCharge', e.target.value)} className="pl-8" />
                </div>
                <p className="text-xs text-muted-foreground">The base rate charged per student for a single meal (lunch or dinner).</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
    </Card>
);

const LeaveContent: FC<any> = ({ editableSettings, handleSettingChange, handleSaveChanges, isSaving }) => {
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

    return (
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
                            checked={editableSettings.leaveDeadlineEnabled}
                            onCheckedChange={(checked) => handleSettingChange('leaveDeadlineEnabled', checked)}
                        />
                    </div>
                    {editableSettings.leaveDeadlineEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-4 pt-4 border-l-2 border-primary/20 ml-6 animate-in fade-in-0 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="lunch-deadline">Lunch Leave Deadline</Label>
                                <Select value={editableSettings.lunchDeadline} onValueChange={(value) => handleSettingChange('lunchDeadline', value)}>
                                    <SelectTrigger id="lunch-deadline">
                                        <SelectValue placeholder="Select a time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lunchTimeOptions.map((option: any) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dinner-deadline">Dinner Leave Deadline</Label>
                                <Select value={editableSettings.dinnerDeadline} onValueChange={(value) => handleSettingChange('dinnerDeadline', value)}>
                                    <SelectTrigger id="dinner-deadline">
                                        <SelectValue placeholder="Select a time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dinnerTimeOptions.map((option: any) => (
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
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user: adminUser, authLoading } = useAuth();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMessInfo, setIsLoadingMessInfo] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    const [editableSettings, setEditableSettings] = useState({
        profileName: '',
        secretCode: '',
        messName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        joinRequestApproval: 'manual' as 'manual' | 'auto',
        leaveDeadlineEnabled: true,
        lunchDeadline: '10:00',
        dinnerDeadline: '18:00',
        perMealCharge: '65',
    });

    const [originalSettings, setOriginalSettings] = useState(editableSettings);
    
    const activeTab = useMemo(() => searchParams.get('tab') || 'profile', [searchParams]);

    const handleSettingChange = (field: keyof typeof editableSettings, value: any) => {
        setEditableSettings(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (adminUser) {
            const fetchMessData = async () => {
                setIsLoadingMessInfo(true);
                const messData = await getMessInfo(adminUser.uid);
                
                const initialData = {
                    profileName: adminUser.name || '',
                    secretCode: adminUser.secretCode || '',
                    messName: messData?.messName || '',
                    contactEmail: messData?.contactEmail || '',
                    contactPhone: messData?.contactPhone || '',
                    address: messData?.address || '',
                    perMealCharge: messData?.perMealCharge?.toString() || '65',
                    joinRequestApproval: messData?.joinRequestApproval || 'manual',
                    leaveDeadlineEnabled: messData?.leaveDeadlineEnabled ?? true,
                    lunchDeadline: messData?.lunchDeadline || '10:00',
                    dinnerDeadline: messData?.dinnerDeadline || '18:00',
                };
                
                setEditableSettings(initialData);
                setOriginalSettings(initialData);
                setIsLoadingMessInfo(false);
                setIsDirty(false);
            };
            fetchMessData();
        }
    }, [adminUser]);

    useEffect(() => {
        const hasUnsavedChanges = JSON.stringify(editableSettings) !== JSON.stringify(originalSettings);
        setIsDirty(hasUnsavedChanges);
    }, [editableSettings, originalSettings]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = ''; // Required for modern browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);
    
    const handleSaveChanges = async () => {
        if (!adminUser) return;
        setIsSaving(true);
        try {
            let userUpdate: Partial<any> = {};
            let messUpdate: Partial<MessInfo> = {};

            if (activeTab === 'profile') {
                userUpdate = {
                    name: editableSettings.profileName,
                    secretCode: editableSettings.secretCode,
                };
            } else if (activeTab === 'general') {
                messUpdate = { 
                    messName: editableSettings.messName, 
                    contactEmail: editableSettings.contactEmail, 
                    contactPhone: editableSettings.contactPhone, 
                    address: editableSettings.address, 
                    joinRequestApproval: editableSettings.joinRequestApproval 
                };
            } else if (activeTab === 'billing') {
                const charge = parseFloat(editableSettings.perMealCharge);
                if (isNaN(charge) || charge < 0) {
                    toast({ variant: 'destructive', title: 'Invalid Price', description: 'Per meal charge must be a positive number.' });
                    setIsSaving(false);
                    return;
                }
                messUpdate = { perMealCharge: charge };
            } else if (activeTab === 'leave') {
                messUpdate = { 
                    leaveDeadlineEnabled: editableSettings.leaveDeadlineEnabled, 
                    lunchDeadline: editableSettings.lunchDeadline, 
                    dinnerDeadline: editableSettings.dinnerDeadline 
                };
            }

            if (Object.keys(userUpdate).length > 0) {
                const userDocRef = doc(db, 'users', adminUser.uid);
                await updateDoc(userDocRef, userUpdate);
            }

            if (Object.keys(messUpdate).length > 0) {
                await updateMessInfo(adminUser.uid, messUpdate);
            }
            
            setOriginalSettings(editableSettings);
            setIsDirty(false);

            toast({ title: 'Settings Saved', description: 'Your changes have been saved successfully.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (authLoading || !adminUser) {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in-0">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
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
                
                <TabsContent value="profile" className="mt-6">
                    <ProfileContent 
                        adminUser={adminUser}
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                    />
                </TabsContent>
                <TabsContent value="general" className="mt-6">
                    <GeneralContent 
                        isLoadingMessInfo={isLoadingMessInfo}
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                    />
                </TabsContent>
                <TabsContent value="billing" className="mt-6">
                    <BillingContent 
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                    />
                </TabsContent>
                <TabsContent value="leave" className="mt-6">
                    <LeaveContent 
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}



    
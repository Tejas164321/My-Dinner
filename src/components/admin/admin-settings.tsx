
'use client';

import { useState, useMemo, useEffect, type FC, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IndianRupee, Info, Copy, User, CalendarClock, Loader2, KeyRound } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getMessInfo, updateMessInfo, type MessInfo } from '@/lib/services/mess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const settingsNav = [
  { title: "Profile", href: "profile", icon: User },
  { title: "General", href: "general", icon: Info },
  { title: "Billing", href: "billing", icon: IndianRupee },
  { title: "Leave Rules", href: "leave", icon: CalendarClock },
];

const ProfileContent: FC<any> = ({ adminUser, editableSettings, handleSettingChange, handleSaveChanges, isSaving, messUniqueId, handleCopy, isDirty }) => (
    <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your personal information and manage your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                    <AvatarFallback>{editableSettings.profileName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center sm:text-left">
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
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveChanges} disabled={isSaving || !isDirty}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </CardFooter>
    </Card>
);

const GeneralContent: FC<any> = ({ isLoadingMessInfo, editableSettings, handleSettingChange, handleSaveChanges, isSaving, isDirty }) => (
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
            <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingMessInfo || !isDirty}>
                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Save Changes
            </Button>
        </CardFooter>
    </Card>
);

const BillingContent: FC<any> = ({ editableSettings, handleSettingChange, handleSaveChanges, isSaving, isDirty }) => (
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
            <Button onClick={handleSaveChanges} disabled={isSaving || !isDirty}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
    </Card>
);

const LeaveContent: FC<any> = ({ editableSettings, handleSettingChange, handleSaveChanges, isSaving, isDirty }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Leave Settings</CardTitle>
                <CardDescription>Set cutoff times for students to apply for meal leaves. This rule is always enforced.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="lunch-deadline">Lunch Leave Deadline</Label>
                            <Input
                                id="lunch-deadline"
                                type="time"
                                value={editableSettings.lunchDeadline}
                                onChange={(e) => handleSettingChange('lunchDeadline', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dinner-deadline">Dinner Leave Deadline</Label>
                            <Input
                                id="dinner-deadline"
                                type="time"
                                value={editableSettings.dinnerDeadline}
                                onChange={(e) => handleSettingChange('dinnerDeadline', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges} disabled={isSaving || !isDirty}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}

export function AdminSettings() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user: adminUser, authLoading } = useAuth();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMessInfo, setIsLoadingMessInfo] = useState(true);
    
    const [originalSettings, setOriginalSettings] = useState<any>({});
    const [editableSettings, setEditableSettings] = useState({
        profileName: '',
        secretCode: '',
        messName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        joinRequestApproval: 'manual' as 'manual' | 'auto',
        lunchDeadline: '10:00',
        dinnerDeadline: '18:00',
        perMealCharge: '65',
    });
    
    const isDirty = useMemo(() => JSON.stringify(originalSettings) !== JSON.stringify(editableSettings), [originalSettings, editableSettings]);
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
                    lunchDeadline: messData?.lunchDeadline || '10:00',
                    dinnerDeadline: messData?.dinnerDeadline || '18:00',
                };
                
                setEditableSettings(initialData);
                setOriginalSettings(initialData);
                setIsLoadingMessInfo(false);
            };
            fetchMessData();
        }
    }, [adminUser]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
    
    const handleSaveChanges = async () => {
        if (!adminUser) return;
        setIsSaving(true);
        try {
            let userUpdate: Partial<any> = {};
            let messUpdate: Partial<MessInfo> = {};

            if(JSON.stringify(originalSettings.profileName) !== JSON.stringify(editableSettings.profileName) || JSON.stringify(originalSettings.secretCode) !== JSON.stringify(editableSettings.secretCode)) {
                userUpdate = { name: editableSettings.profileName, secretCode: editableSettings.secretCode };
            }

            if(JSON.stringify(originalSettings.messName) !== JSON.stringify(editableSettings.messName) || JSON.stringify(originalSettings.contactEmail) !== JSON.stringify(editableSettings.contactEmail) || JSON.stringify(originalSettings.contactPhone) !== JSON.stringify(editableSettings.contactPhone) || JSON.stringify(originalSettings.address) !== JSON.stringify(editableSettings.address) || JSON.stringify(originalSettings.joinRequestApproval) !== JSON.stringify(editableSettings.joinRequestApproval)) {
                messUpdate = { ...messUpdate, messName: editableSettings.messName, contactEmail: editableSettings.contactEmail, contactPhone: editableSettings.contactPhone, address: editableSettings.address, joinRequestApproval: editableSettings.joinRequestApproval };
            }
            
            if(JSON.stringify(originalSettings.perMealCharge) !== JSON.stringify(editableSettings.perMealCharge)) {
                 const charge = parseFloat(editableSettings.perMealCharge);
                if (isNaN(charge) || charge < 0) {
                    toast({ variant: 'destructive', title: 'Invalid Price', description: 'Per meal charge must be a positive number.' });
                    setIsSaving(false);
                    return;
                }
                messUpdate = { ...messUpdate, perMealCharge: charge };
            }

            if(JSON.stringify(originalSettings.lunchDeadline) !== JSON.stringify(editableSettings.lunchDeadline) || JSON.stringify(originalSettings.dinnerDeadline) !== JSON.stringify(editableSettings.dinnerDeadline)) {
                messUpdate = { ...messUpdate, lunchDeadline: editableSettings.lunchDeadline, dinnerDeadline: editableSettings.dinnerDeadline };
            }

            if (Object.keys(userUpdate).length > 0) {
                const userDocRef = doc(db, 'users', adminUser.uid);
                await updateDoc(userDocRef, userUpdate);
            }

            if (Object.keys(messUpdate).length > 0) {
                await updateMessInfo(adminUser.uid, messUpdate);
            }
            
            setOriginalSettings(editableSettings);
            toast({ title: 'Settings Saved', description: 'Your changes have been saved successfully.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const messUniqueId = useMemo(() => {
        if (!adminUser?.uid) return 'loading...';
        const slugBase = (editableSettings.messName || 'mess').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const slug = slugBase.substring(0, 10);
        const uidSuffix = adminUser.uid.slice(0, 4);
        return `${slug}-${uidSuffix}`;
    }, [editableSettings.messName, adminUser]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!", description: `The ${label} "${text}" has been copied.` });
    };

    const handleTabChange = (value: string) => {
        if(isDirty) {
            if(confirm("You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost.")) {
                router.replace(`${pathname}?tab=${value}`, { scroll: false });
                setEditableSettings(originalSettings); // Reset changes
            }
        } else {
             router.replace(`${pathname}?tab=${value}`, { scroll: false });
        }
    };

    if (authLoading || !adminUser) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
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
                        messUniqueId={messUniqueId}
                        handleCopy={handleCopy}
                        isDirty={isDirty}
                    />
                </TabsContent>
                <TabsContent value="general" className="mt-6">
                    <GeneralContent 
                        isLoadingMessInfo={isLoadingMessInfo}
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                        isDirty={isDirty}
                    />
                </TabsContent>
                <TabsContent value="billing" className="mt-6">
                    <BillingContent 
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                        isDirty={isDirty}
                    />
                </TabsContent>
                <TabsContent value="leave" className="mt-6">
                    <LeaveContent 
                        editableSettings={editableSettings}
                        handleSettingChange={handleSettingChange}
                        handleSaveChanges={handleSaveChanges}
                        isSaving={isSaving}
                        isDirty={isDirty}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}


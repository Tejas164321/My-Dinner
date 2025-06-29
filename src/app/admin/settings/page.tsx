'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Palette, Bell, Info, Moon, Sun, RefreshCw, Copy, User } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { adminUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
    const { toast } = useToast();

    // Profile Settings State
    const [profileName, setProfileName] = useState(adminUser.name);
    const [profileEmail, setProfileEmail] = useState(adminUser.email);

    // General Settings State
    const [messName, setMessName] = useState('Messo Central Kitchen');
    const [contactEmail, setContactEmail] = useState('contact@messo.com');
    const [contactPhone, setContactPhone] = useState('+91 12345 67890');
    const [address, setAddress] = useState('123 College Road, University Campus, New Delhi - 110001');
    const [secretCode, setSecretCode] = useState('A8XFGT');
    const [joinRequestApproval, setJoinRequestApproval] = useState<'manual' | 'auto'>('manual');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Billing Settings State
    const [perMealCharge, setPerMealCharge] = useState('65.00');

    // Appearance Settings State
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const handleRegenerateCode = () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
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
            description: "The secret code has been copied.",
        });
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your mess settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="general"><Info className="mr-2 h-4 w-4" /> General</TabsTrigger>
                    <TabsTrigger value="billing"><DollarSign className="mr-2 h-4 w-4" /> Billing</TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Update your personal information and manage your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-24 h-24 border-4 border-primary/20">
                                    <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                                    <AvatarFallback>{adminUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold">{profileName}</h3>
                                    <p className="text-muted-foreground">{adminUser.role}</p>
                                    <Button variant="outline">Upload New Photo</Button>
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
                                    <div className="space-y-2">
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
                                    <h3 className="font-medium">Mess Secret Code</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Students will need this secret code to submit a join request.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 rounded-lg border p-4 bg-secondary/50">
                                    <div className="flex-1">
                                        <span className="font-mono text-lg tracking-widest bg-background px-4 py-2 rounded-md">{secretCode}</span>
                                    </div>
                                    <Button variant="outline" onClick={handleRegenerateCode}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Regenerate
                                    </Button>
                                    <Button onClick={handleCopyCode}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy
                                    </Button>
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

                 <TabsContent value="appearance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance & Theme</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 max-w-md">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <RadioGroup
                                    value={theme}
                                    onValueChange={(value: 'light' | 'dark') => setTheme(value)}
                                    className="grid max-w-md grid-cols-2 gap-4 pt-2"
                                >
                                    <div>
                                        <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                        <Label
                                            htmlFor="light"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            <Sun className="mb-3 h-6 w-6" />
                                            Light
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                        <Label
                                            htmlFor="dark"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            <Moon className="mb-3 h-6 w-6" />
                                            Dark
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button>Save & Apply Theme</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

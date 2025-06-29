'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Palette, Bell, Info, Moon, Sun } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function SettingsPage() {
    // General Settings State
    const [messName, setMessName] = useState('Messo Central Kitchen');
    const [contactEmail, setContactEmail] = useState('contact@messo.com');
    const [contactPhone, setContactPhone] = useState('+91 12345 67890');
    const [address, setAddress] = useState('123 College Road, University Campus, New Delhi - 110001');
    const [joinRequestApproval, setJoinRequestApproval] = useState<'manual' | 'auto'>('manual');

    // Billing Settings State
    const [perMealCharge, setPerMealCharge] = useState('65.00');

    // Notification Settings State
    const [joinRequestNotif, setJoinRequestNotif] = useState(true);
    const [paymentReceivedNotif, setPaymentReceivedNotif] = useState(true);
    const [feedbackNotif, setFeedbackNotif] = useState(false);

    // Appearance Settings State
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your mess settings and preferences.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="general"><Info className="mr-2 h-4 w-4" /> General</TabsTrigger>
                    <TabsTrigger value="billing"><DollarSign className="mr-2 h-4 w-4" /> Billing</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
                </TabsList>
                
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
                                    <div className="flex items-center gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="manual" id="manual" />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="manual" className="cursor-pointer font-normal">
                                                Manual Approval
                                                <p className="text-sm text-muted-foreground">
                                                    Admin must manually approve each new student join request. (Recommended)
                                                </p>
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="auto" id="auto" />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="auto" className="cursor-pointer font-normal">
                                                Automatic Approval
                                                <p className="text-sm text-muted-foreground">
                                                    Automatically approve all new join requests. Use with caution.
                                                </p>
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
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

                 <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose which email notifications you want to receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notif-join" className="text-base">New Join Request</Label>
                                    <p className="text-sm text-muted-foreground">Receive an email when a new student applies to join the mess.</p>
                                </div>
                                <Switch id="notif-join" checked={joinRequestNotif} onCheckedChange={setJoinRequestNotif} />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notif-payment" className="text-base">Payment Received</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when a student successfully pays their monthly bill.</p>
                                </div>
                                <Switch id="notif-payment" checked={paymentReceivedNotif} onCheckedChange={setPaymentReceivedNotif} />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notif-feedback" className="text-base">Feedback Submitted</Label>
                                    <p className="text-sm text-muted-foreground">Receive an alert when a student submits feedback about the mess.</p>
                                </div>
                                <Switch id="notif-feedback" checked={feedbackNotif} onCheckedChange={setFeedbackNotif} />
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

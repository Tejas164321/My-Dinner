'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Palette, Bell, Info } from 'lucide-react';

export default function SettingsPage() {
    // General Settings State
    const [messName, setMessName] = useState('Messo Central Kitchen');
    const [contactEmail, setContactEmail] = useState('contact@messo.com');
    const [contactPhone, setContactPhone] = useState('+91 12345 67890');
    const [address, setAddress] = useState('123 College Road, University Campus, New Delhi - 110001');

    // Billing Settings State
    const [dailyRate, setDailyRate] = useState('120.00');
    const [extraMealCharge, setExtraMealCharge] = useState('50.00');

    // Notification Settings State
    const [joinRequestNotif, setJoinRequestNotif] = useState(true);
    const [paymentReceivedNotif, setPaymentReceivedNotif] = useState(true);
    const [feedbackNotif, setFeedbackNotif] = useState(false);

    // Appearance Settings State
    const [primaryColor, setPrimaryColor] = useState('217.2 91.2% 59.8%');
    const [accentColor, setAccentColor] = useState('262.1 83.3% 57.8%');

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
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Update basic details about your mess facility.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                <Label htmlFor="daily-rate">Daily Rate (INR)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="daily-rate" type="number" placeholder="120.00" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="pl-8" />
                                </div>
                                <p className="text-xs text-muted-foreground">The base rate charged per student per day for meals.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="extra-meal-charge">Extra Meal Charge (INR)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="extra-meal-charge" type="number" placeholder="50.00" value={extraMealCharge} onChange={(e) => setExtraMealCharge(e.target.value)} className="pl-8" />
                                </div>
                                <p className="text-xs text-muted-foreground">The cost for an extra meal taken by a guest or non-registered person.</p>
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
                                <Label htmlFor="primary-color">Primary Color (HSL)</Label>
                                <Input id="primary-color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Used for main buttons, links, and highlights. E.g., `217.2 91.2% 59.8%`</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="accent-color">Accent Color (HSL)</Label>
                                <Input id="accent-color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Used for secondary highlights and visual flair. E.g., `262.1 83.3% 57.8%`</p>
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

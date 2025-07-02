
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { studentUser, messInfo } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Palette, Moon, Sun, Camera, Building2, Mail, Phone, MapPin, Utensils, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function StudentSettingsPage() {
    const { toast } = useToast();

    // Profile Settings State
    const [name, setName] = useState(studentUser.name);
    const [email, setEmail] = useState(studentUser.email);
    const [contact, setContact] = useState(studentUser.contact);

    // Notification Settings
    const [inAppNotifications, setInAppNotifications] = useState(true);

    // Appearance Settings
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Meal Plan Settings
    const [currentPlan, setCurrentPlan] = useState<'full_day' | 'lunch_only' | 'dinner_only'>(studentUser.messPlan);
    const [selectedPlan, setSelectedPlan] = useState<'full_day' | 'lunch_only' | 'dinner_only'>(studentUser.messPlan);
    const [isRequestPending, setIsRequestPending] = useState(false);


    const handleSaveChanges = () => {
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    };

    const handleSaveAppearance = () => {
         toast({
            title: "Theme Updated",
            description: `The theme has been set to ${theme}.`,
        });
    };

    const handlePlanChangeRequest = () => {
        setIsRequestPending(true);
        toast({
            title: "Request Submitted",
            description: `Your request to change to the "${selectedPlan.replace('_', ' ')}" plan is pending admin approval.`,
        });
    };
    
    const planDetails = {
        full_day: { name: 'Full Day', description: 'Includes both lunch and dinner.' },
        lunch_only: { name: 'Lunch Only', description: 'Includes only lunch every day.' },
        dinner_only: { name: 'Dinner Only', description: 'Includes only dinner every day.' }
    };


    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                 <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> My Profile</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="mess-info"><Building2 className="mr-2 h-4 w-4" /> Mess Info</TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
                    <TabsTrigger value="meal-plan"><Utensils className="mr-2 h-4 w-4" /> Meal Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Update your personal information and manage your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="relative flex-shrink-0">
                                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                                        <AvatarImage src={studentUser.avatarUrl} alt={name} />
                                        <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 z-10 rounded-full h-9 w-9 border-2 bg-background hover:bg-accent border-background">
                                        <Camera className="h-4 w-4" />
                                        <span className="sr-only">Upload New Photo</span>
                                    </Button>
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-2xl font-semibold">{name}</h3>
                                    <p className="text-muted-foreground">{studentUser.role}</p>
                                    <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Student ID:</span>
                                            <span>{studentUser.studentId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Joined:</span>
                                            <span>{studentUser.joinDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-semibold text-foreground/90">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name">Full Name</Label>
                                        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-contact">Contact Number</Label>
                                        <Input id="profile-contact" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="profile-email">Email Address</Label>
                                        <Input id="profile-email" type="email" value={email} readOnly disabled />
                                        <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
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
                            <Button onClick={handleSaveChanges}>Update Profile</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Manage how you receive communications from the mess.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="in-app-notifs" className="text-base">In-App Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive alerts for announcements and billing directly in the app.</p>
                                </div>
                                <Switch id="in-app-notifs" checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="mess-info" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mess Information</CardTitle>
                            <CardDescription>Details of the mess facility you are enrolled in.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex items-start gap-4">
                                <Building2 className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">{messInfo.name}</p>
                                    <p className="text-sm text-muted-foreground">Mess Name</p>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground">{messInfo.address}</p>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex items-start gap-4">
                                <Mail className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground">{messInfo.email}</p>
                                    <p className="text-sm text-muted-foreground">Contact Email</p>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex items-start gap-4">
                                <Phone className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground">{messInfo.phone}</p>
                                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                                </div>
                            </div>
                        </CardContent>
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
                            <Button onClick={handleSaveAppearance}>Save & Apply Theme</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                 <TabsContent value="meal-plan" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Meal Plan</CardTitle>
                            <CardDescription>Request a change to your subscription. Changes require admin approval.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {isRequestPending ? (
                                <Alert>
                                    <Bell className="h-4 w-4" />
                                    <AlertTitle>Request Pending Approval</AlertTitle>
                                    <AlertDescription>
                                        Your request to switch to the <span className="font-semibold capitalize">{selectedPlan.replace('_', ' ')}</span> plan has been submitted. You will be notified once the admin approves it.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Your current plan is: <span className="font-bold text-primary capitalize">{currentPlan.replace('_', ' ')}</span>. Select a new plan below to request a change.
                                    </p>
                                    <RadioGroup
                                        value={selectedPlan}
                                        onValueChange={(value) => setSelectedPlan(value as 'full_day' | 'lunch_only' | 'dinner_only')}
                                        className="space-y-3"
                                    >
                                        <Label htmlFor="full_day" className={cn("flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50", selectedPlan === 'full_day' && "border-primary")}>
                                            <RadioGroupItem value="full_day" id="full_day" className="mt-1" />
                                            <div className="grid gap-1.5 leading-none">
                                                <div className="font-semibold flex items-center gap-2">
                                                    <Utensils className="h-4 w-4 text-primary" /> Full Day
                                                </div>
                                                <p className="text-sm text-muted-foreground">{planDetails.full_day.description}</p>
                                            </div>
                                        </Label>
                                        <Label htmlFor="lunch_only" className={cn("flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50", selectedPlan === 'lunch_only' && "border-primary")}>
                                            <RadioGroupItem value="lunch_only" id="lunch_only" className="mt-1" />
                                            <div className="grid gap-1.5 leading-none">
                                                <div className="font-semibold flex items-center gap-2">
                                                    <Sun className="h-4 w-4 text-yellow-400" /> Lunch Only
                                                </div>
                                                <p className="text-sm text-muted-foreground">{planDetails.lunch_only.description}</p>
                                            </div>
                                        </Label>
                                        <Label htmlFor="dinner_only" className={cn("flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50", selectedPlan === 'dinner_only' && "border-primary")}>
                                            <RadioGroupItem value="dinner_only" id="dinner_only" className="mt-1" />
                                            <div className="grid gap-1.5 leading-none">
                                                <div className="font-semibold flex items-center gap-2">
                                                    <Moon className="h-4 w-4 text-purple-400" /> Dinner Only
                                                </div>
                                                <p className="text-sm text-muted-foreground">{planDetails.dinner_only.description}</p>
                                            </div>
                                        </Label>
                                    </RadioGroup>
                                </div>
                            )}
                        </CardContent>
                         <CardFooter>
                            <Button 
                                onClick={handlePlanChangeRequest}
                                disabled={isRequestPending || currentPlan === selectedPlan}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isRequestPending ? "Request Sent" : "Submit Change Request"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}

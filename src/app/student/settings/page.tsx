
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { studentUser, messInfo } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Palette, Moon, Sun, Camera, Building2, Mail, Phone, MapPin, Utensils, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type MessPlan = 'full_day' | 'lunch_only' | 'dinner_only';

const planDetails: Record<MessPlan, { name: string; icon: React.ElementType; description: string }> = {
    full_day: { name: "Full Day", icon: Utensils, description: "Includes both lunch and dinner." },
    lunch_only: { name: "Lunch Only", icon: Sun, description: "Includes only lunch." },
    dinner_only: { name: "Dinner Only", icon: Moon, description: "Includes only dinner." },
};

export default function StudentSettingsPage() {
    const { toast } = useToast();

    // Profile Settings State
    const [name, setName] = useState(studentUser.name);
    const [email, setEmail] = useState(studentUser.email);
    const [contact, setContact] = useState(studentUser.contact);
    const [currentPlan, setCurrentPlan] = useState<MessPlan>(studentUser.messPlan as MessPlan);
    const [selectedPlan, setSelectedPlan] = useState<MessPlan>(studentUser.messPlan as MessPlan);
    const [pendingPlan, setPendingPlan] = useState<MessPlan | null>(null);

    // Notification Settings
    const [inAppNotifications, setInAppNotifications] = useState(true);

    // Appearance Settings
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');


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
    }

    const handleRequestPlanChange = () => {
        setPendingPlan(selectedPlan);
        toast({
            title: "Plan Change Request Sent",
            description: `Your request to switch to the "${planDetails[selectedPlan].name}" plan is now pending admin approval.`,
        });
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                 <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> My Profile</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="mess-info"><Building2 className="mr-2 h-4 w-4" /> Mess Info</TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
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

                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-semibold text-foreground/90">Manage Mess Plan</h3>
                                {pendingPlan ? (
                                    <Alert variant="default" className="border-accent text-accent-foreground">
                                        <AlertCircle className="h-4 w-4 !text-accent" />
                                        <AlertTitle>Request Pending Approval</AlertTitle>
                                        <AlertDescription>
                                            Your request to switch to the <span className="font-semibold">{planDetails[pendingPlan].name}</span> plan is being reviewed by the admin.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Your current plan is <span className="font-semibold text-primary">{planDetails[currentPlan].name}</span>. Select a new plan below to request a change.
                                    </p>
                                )}
                                
                                <RadioGroup
                                    value={selectedPlan}
                                    onValueChange={(value: MessPlan) => setSelectedPlan(value)}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                    disabled={!!pendingPlan}
                                >
                                    {(Object.keys(planDetails) as MessPlan[]).map((plan) => {
                                        const { name, icon: Icon, description } = planDetails[plan];
                                        return (
                                            <Label 
                                                key={plan}
                                                htmlFor={plan} 
                                                className="flex flex-col items-start justify-start text-left rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-60"
                                            >
                                                <RadioGroupItem value={plan} id={plan} className="sr-only" disabled={!!pendingPlan} />
                                                <Icon className="mb-3 h-6 w-6" />
                                                <span className="font-semibold text-foreground">{name}</span>
                                                <span className="text-xs text-muted-foreground mt-1">{description}</span>
                                            </Label>
                                        );
                                    })}
                                </RadioGroup>
                                 <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleRequestPlanChange}
                                        disabled={!!pendingPlan || selectedPlan === currentPlan}
                                    >
                                        Request Plan Change
                                    </Button>
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

            </Tabs>
        </div>
    );
}

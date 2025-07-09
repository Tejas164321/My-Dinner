
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { messInfo, type Student } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Building2, Mail, Phone, MapPin, Utensils, Send, Camera, Moon, Sun, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Client-side action
async function submitPlanChangeRequest(studentUid: string, studentId: string, studentName: string, fromPlan: Student['messPlan'], toPlan: Student['messPlan'], messId: string) {
    await addDoc(collection(db, 'planChangeRequests'), {
        studentUid,
        studentId,
        studentName,
        fromPlan,
        toPlan,
        messId,
        date: new Date().toISOString(),
    });
}


export default function StudentSettingsPage() {
    const { toast } = useToast();
    const { user } = useAuth();

    // Profile Settings State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [contact, setContact] = useState(user?.contact || '');

    // Notification Settings
    const [inAppNotifications, setInAppNotifications] = useState(true);

    // Appearance Settings
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Meal Plan Settings
    const [currentPlan, setCurrentPlan] = useState<'full_day' | 'lunch_only' | 'dinner_only'>(user?.messPlan || 'full_day');
    const [selectedPlan, setSelectedPlan] = useState<'full_day' | 'lunch_only' | 'dinner_only'>(user?.messPlan || 'full_day');
    const [isRequestPending, setIsRequestPending] = useState(false);


    const handleSaveChanges = () => {
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    };
    
    const handlePlanChangeRequest = async () => {
        if (!user || !user.uid || !user.studentId || !user.messId) {
             toast({ variant: 'destructive', title: "Error", description: "User information is missing." });
             return;
        }

        try {
            await submitPlanChangeRequest(user.uid, user.studentId, user.name || 'Student', currentPlan, selectedPlan, user.messId);
            setIsRequestPending(true);
            toast({
                title: "Request Submitted",
                description: `Your request to change to the "${selectedPlan.replace('_', ' ')}" plan is pending admin approval.`,
            });
        } catch (error) {
            toast({ variant: 'destructive', title: "Submission Failed", description: "Could not submit your request. Please try again." });
        }
    };
    
    const planDetails = {
        full_day: { name: 'Full Day', description: 'Includes both lunch and dinner.' },
        lunch_only: { name: 'Lunch Only', description: 'Includes only lunch every day.' },
        dinner_only: { name: 'Dinner Only', description: 'Includes only dinner every day.' }
    };

    if (!user) {
        return null; // or a loading spinner
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
                    <Link href="/student/support" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Support</span>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                 <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> My Profile</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="meal-plan"><Utensils className="mr-2 h-4 w-4" /> Meal Plan</TabsTrigger>
                    <TabsTrigger value="mess-info"><Building2 className="mr-2 h-4 w-4" /> Mess Info</TabsTrigger>
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
                                        <AvatarImage src={user.avatarUrl} alt={name} />
                                        <AvatarFallback>{name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 z-10 rounded-full h-9 w-9 border-2 bg-background hover:bg-accent border-background">
                                        <Camera className="h-4 w-4" />
                                        <span className="sr-only">Upload New Photo</span>
                                    </Button>
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-2xl font-semibold">{name}</h3>
                                    <p className="text-muted-foreground">Student</p>
                                    <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Student ID:</span>
                                            <span>{user.studentId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Joined:</span>
                                            <span>{user.joinDate}</span>
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                       <button onClick={() => setSelectedPlan('full_day')} className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all h-40", selectedPlan === 'full_day' ? 'border-primary' : 'border-muted bg-popover')}>
                                            <Utensils className="mb-3 h-8 w-8 text-primary" />
                                            <span className="font-semibold">{planDetails.full_day.name}</span>
                                            <p className="text-xs text-muted-foreground mt-1">{planDetails.full_day.description}</p>
                                        </button>
                                         <button onClick={() => setSelectedPlan('lunch_only')} className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all h-40", selectedPlan === 'lunch_only' ? 'border-primary' : 'border-muted bg-popover')}>
                                            <Sun className="mb-3 h-8 w-8 text-yellow-400" />
                                            <span className="font-semibold">{planDetails.lunch_only.name}</span>
                                            <p className="text-xs text-muted-foreground mt-1">{planDetails.lunch_only.description}</p>
                                        </button>
                                         <button onClick={() => setSelectedPlan('dinner_only')} className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all h-40", selectedPlan === 'dinner_only' ? 'border-primary' : 'border-muted bg-popover')}>
                                            <Moon className="mb-3 h-8 w-8 text-purple-400" />
                                            <span className="font-semibold">{planDetails.dinner_only.name}</span>
                                            <p className="text-xs text-muted-foreground mt-1">{planDetails.dinner_only.description}</p>
                                        </button>
                                    </div>
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

            </Tabs>
        </div>
    );
}

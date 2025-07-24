
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import type { Student } from '@/lib/data';
import { getMessInfo, type MessInfo } from '@/lib/services/mess';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Building2, Mail, Phone, MapPin, Utensils, Send, Camera, HelpCircle, Loader2, Sun, Moon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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
    const { user, loading: authLoading } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMessInfo, setIsLoadingMessInfo] = useState(true);

    // Profile Settings State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    
    // Mess Info State
    const [messInfo, setMessInfo] = useState<MessInfo | null>(null);

    // Meal Plan Settings
    const [currentPlan, setCurrentPlan] = useState<'full_day' | 'lunch_only' | 'dinner_only'>('full_day');
    const [selectedPlan, setSelectedPlan] = useState<'full_day' | 'lunch_only' | 'dinner_only'>('full_day');
    const [isRequestPending, setIsRequestPending] = useState(false);
    
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setContact(user.contact || '');
            setCurrentPlan(user.messPlan || 'full_day');
            setSelectedPlan(user.messPlan || 'full_day');

            if (user.messId) {
                const fetchMessData = async () => {
                    setIsLoadingMessInfo(true);
                    const info = await getMessInfo(user.messId!);
                    setMessInfo(info);
                    setIsLoadingMessInfo(false);
                };
                fetchMessData();
            } else {
                setIsLoadingMessInfo(false);
            }
        }
    }, [user]);


    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name: name,
                contact: contact,
            });
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not save your changes. Please try again." });
        } finally {
            setIsSaving(false);
        }
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
        full_day: { name: 'Full Day', description: 'Includes both lunch and dinner.', icon: Utensils, color: 'text-primary' },
        lunch_only: { name: 'Lunch Only', description: 'Includes only lunch every day.', icon: Sun, color: 'text-yellow-400' },
        dinner_only: { name: 'Dinner Only', description: 'Includes only dinner every day.', icon: Moon, color: 'text-purple-400' }
    };

    if (authLoading || !user) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                 <div className="flex items-center gap-2">
                    <Link href="/student/support" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Support</span>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                 <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> My Profile</TabsTrigger>
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
                            <div className="flex flex-col sm:flex-row items-center gap-8">
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
                                <div className="space-y-1.5 text-center sm:text-left">
                                    <h3 className="text-2xl font-semibold">{name}</h3>
                                    <p className="text-muted-foreground capitalize">{user.role}</p>
                                    <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="font-semibold text-foreground">Student ID:</span>
                                            <span>{user.studentId}</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="font-semibold text-foreground">Joined:</span>
                                            <span>{user.joinDate ? format(new Date(user.joinDate), 'd MMM, yyyy') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="font-semibold text-foreground/90">Personal Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name">Full Name</Label>
                                        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-contact">Contact Number</Label>
                                        <Input id="profile-contact" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="profile-email">Email Address</Label>
                                        <Input id="profile-email" type="email" value={email} readOnly disabled />
                                        <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? 'Saving...' : 'Update Profile'}
                            </Button>
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
                                        {Object.entries(planDetails).map(([planKey, planValue]) => {
                                            const key = planKey as keyof typeof planDetails;
                                            const { icon: Icon, name, description, color } = planValue;
                                            return (
                                                <button 
                                                    key={key}
                                                    onClick={() => setSelectedPlan(key)} 
                                                    className={cn(
                                                        "flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all h-40", 
                                                        selectedPlan === key ? 'border-primary' : 'border-muted bg-popover'
                                                    )}
                                                >
                                                    <Icon className={cn("mb-3 h-8 w-8", color)} />
                                                    <span className="font-semibold">{name}</span>
                                                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                                                </button>
                                            )
                                        })}
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
                            {isLoadingMessInfo ? <Skeleton className="h-48 w-full" /> : !messInfo ? <p>Could not load mess information.</p> : (
                            <>
                            <div className="flex items-start gap-4">
                                <Building2 className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">{messInfo.messName}</p>
                                    <p className="text-sm text-muted-foreground">Mess Name</p>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground">{messInfo.address || 'Not provided'}</p>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex items-start gap-4">
                                <Mail className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground">{messInfo.contactEmail || 'Not provided'}</p>
                                    <p className="text-sm text-muted-foreground">Contact Email</p>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex items-start gap-4">
                                <Phone className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground">{messInfo.contactPhone || 'Not provided'}</p>
                                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                                </div>
                            </div>
                            </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}

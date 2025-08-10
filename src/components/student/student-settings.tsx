
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import type { Student } from '@/lib/data';
import { getMessInfo, type MessInfo } from '@/lib/services/mess';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building2, Utensils, Send, Camera, Loader2, Sun, Moon, LogOut, Mail, Phone, MapPin, LifeBuoy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addDoc, collection, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { leaveMessAction } from '@/lib/actions/user';
import Link from 'next/link';

async function submitPlanChangeRequest(studentUid: string, studentId: string, studentName: string, fromPlan: Student['messPlan'], toPlan: Student['messPlan'], messId: string) {
    if (!fromPlan || !toPlan) {
        throw new Error("Meal plan information is missing.");
    }
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

const settingsNav = [
  { title: "My Profile", href: "profile", icon: User },
  { title: "Meal Plan", href: "meal-plan", icon: Utensils },
  { title: "Mess Info", href: "mess-info", icon: Building2 },
];

export function StudentSettings() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, authLoading } = useAuth();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLeaving, startLeavingTransition] = useTransition();

    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [isProfileDirty, setIsProfileDirty] = useState(false);

    const [messInfo, setMessInfo] = useState<MessInfo | null>(null);
    const [isLoadingMessInfo, setIsLoadingMessInfo] = useState(true);

    const [currentPlan, setCurrentPlan] = useState<Student['messPlan']>('full_day');
    const [selectedPlan, setSelectedPlan] = useState<Student['messPlan']>('full_day');
    const [isRequestPending, setIsRequestPending] = useState(false);
    
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!user || !user.uid) return;
        const q = query(collection(db, 'planChangeRequests'), where("studentUid", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIsRequestPending(!snapshot.empty);
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setContact(user.contact || '');
            setCurrentPlan(user.messPlan || 'full_day');
            setSelectedPlan(user.messPlan || 'full_day');
            setIsProfileDirty(false);

            if (user.messId) {
                setIsLoadingMessInfo(true);
                getMessInfo(user.messId).then(info => {
                    setMessInfo(info);
                    setIsLoadingMessInfo(false);
                });
            } else {
                setIsLoadingMessInfo(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if(user) {
            const dirty = (user.name || '') !== name || (user.contact || '') !== contact;
            setIsProfileDirty(dirty);
        }
    }, [name, contact, user]);

    const handleProfileUpdate = async () => {
        if (!user || !isProfileDirty) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { name, contact });
            setIsProfileDirty(false);
            toast({ title: "Profile Updated" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Update Failed" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handlePlanChangeRequest = async () => {
        if (!user || !user.uid || !user.studentId || !user.messId || !user.messPlan) return;
        try {
            await submitPlanChangeRequest(user.uid, user.studentId, user.name || 'Student', user.messPlan, selectedPlan, user.messId);
            toast({ title: "Request Submitted" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Submission Failed" });
        }
    };

    const handleLeaveMess = () => {
        if (!user) return;
        startLeavingTransition(() => {
            leaveMessAction(user.uid).then(() => {
                toast({ title: 'Left Successfully' });
            }).catch(() => {
                toast({ variant: 'destructive', title: 'Error leaving mess' });
            });
        });
    };

    if (authLoading || !user) {
        return <Skeleton className="h-96 w-full" />;
    }

    const planDetails = {
        full_day: { name: 'Full Day', description: 'Lunch & Dinner', icon: Utensils, color: 'text-primary' },
        lunch_only: { name: 'Lunch Only', description: 'Only Lunch', icon: Sun, color: 'text-yellow-400' },
        dinner_only: { name: 'Dinner Only', description: 'Only Dinner', icon: Moon, color: 'text-purple-400' }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                 <div className="flex items-center gap-2">
                     <Button asChild variant="outline">
                         <Link href="/student/support">
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            Support
                         </Link>
                     </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Mess
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove you from the current mess. You will have to re-apply to join again. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLeaveMess} disabled={isLeaving} className={cn(buttonVariants({ variant: "destructive" }))}>
                                    {isLeaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm & Leave
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                    {settingsNav.map((item) => (
                        <TabsTrigger key={item.href} value={item.href} className="flex-col sm:flex-row gap-2 py-2">
                            <item.icon className="h-4 w-4"/> {item.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                     <Card>
                        <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative flex-shrink-0">
                                    <Avatar className="w-24 h-24 border-4 border-primary/20"><AvatarImage src={user.avatarUrl} /><AvatarFallback>{name?.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                    <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 z-10 rounded-full h-9 w-9 border-2 bg-background hover:bg-accent border-background"><Camera className="h-4 w-4" /><span className="sr-only">Upload</span></Button>
                                </div>
                                <div className="space-y-2 text-center sm:text-left">
                                    <h3 className="text-2xl font-semibold">{user.name}</h3>
                                    <div className="text-sm text-muted-foreground">ID: {user.studentId || 'N/A'}</div>
                                    <div className="text-sm text-muted-foreground">Joined: {user.joinDate ? format(new Date(user.joinDate), 'd MMM, yyyy') : 'N/A'}</div>
                                </div>
                            </div>
                            <Separator />
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
                                    <Input id="profile-email" type="email" value={user.email} readOnly disabled />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleProfileUpdate} disabled={isSaving || !isProfileDirty}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="meal-plan" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Manage Meal Plan</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {isRequestPending ? (
                                <Alert><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Request Pending</AlertTitle><AlertDescription>Your plan change request is pending admin approval.</AlertDescription></Alert>
                            ) : (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-4">Current plan: <span className="font-bold text-primary capitalize">{currentPlan.replace('_', ' ')}</span></p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {Object.entries(planDetails).map(([planKey, details]) => (
                                            <button key={planKey} onClick={() => setSelectedPlan(planKey as Student['messPlan'])} className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 h-36 transition-all", selectedPlan === planKey ? 'border-primary bg-primary/10' : 'border-muted bg-popover hover:bg-accent')}>
                                                <details.icon className={cn("mb-2 h-8 w-8", details.color)} />
                                                <span className="font-semibold text-base">{details.name}</span>
                                                <p className="text-xs text-muted-foreground mt-1">{details.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePlanChangeRequest} disabled={isRequestPending || currentPlan === selectedPlan}><Send className="mr-2 h-4 w-4" />Submit Change Request</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="mess-info" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Mess Information</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {isLoadingMessInfo ? <Skeleton className="h-48 w-full" /> : !messInfo ? <p>Could not load mess information.</p> : (
                            <>
                                <div className="flex items-start gap-4"><Building2 className="h-6 w-6 text-muted-foreground mt-1" /><div><p className="font-semibold">{messInfo.messName}</p><p className="text-sm text-muted-foreground">Mess Name</p></div></div><Separator />
                                <div className="flex items-start gap-4"><MapPin className="h-6 w-6 text-muted-foreground mt-1" /><div><p>{messInfo.address || 'Not provided'}</p><p className="text-sm text-muted-foreground">Address</p></div></div><Separator />
                                <div className="flex items-start gap-4"><Mail className="h-6 w-6 text-muted-foreground mt-1" /><div><p>{messInfo.contactEmail || 'Not provided'}</p><p className="text-sm text-muted-foreground">Contact Email</p></div></div><Separator />
                                <div className="flex items-start gap-4"><Phone className="h-6 w-6 text-muted-foreground mt-1" /><div><p>{messInfo.contactPhone || 'Not provided'}</p><p className="text-sm text-muted-foreground">Contact Phone</p></div></div>
                            </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Send, Loader2, Utensils, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { updateDoc, doc, getDoc, writeBatch, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';
import { getMessInfo } from '@/lib/services/mess';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

function JoinMessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const messAdminUid = searchParams.get('messId'); 
    const messName = searchParams.get('messName');

    const [secretCode, setSecretCode] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<Student['messPlan']>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!user || !messAdminUid || !messName) {
            toast({ variant: 'destructive', title: 'Error', description: 'User or mess information is missing.' });
            setIsSubmitting(false);
            return;
        }

        if (!secretCode || secretCode.length !== 4 || !selectedPlan) {
             toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a meal plan and enter the 4-digit secret code.' });
             setIsSubmitting(false);
             return;
        }

        try {
            // 1. Fetch the admin's user document to validate the secret code & get settings.
            const messAdminUserRef = doc(db, 'users', messAdminUid);
            const messAdminDoc = await getDoc(messAdminUserRef);
            
            if (!messAdminDoc.exists() || messAdminDoc.data()?.role !== 'admin') {
                toast({ variant: 'destructive', title: 'Validation Failed', description: 'Invalid mess selected.' });
                setIsSubmitting(false);
                return;
            }

            if (messAdminDoc.data()?.secretCode !== secretCode) {
                toast({ variant: 'destructive', title: 'Incorrect Code', description: 'The secret code you entered is incorrect.' });
                setIsSubmitting(false);
                return;
            }

            // 2. Fetch mess-specific settings to check for auto-approval
            const messSettings = await getMessInfo(messAdminUid);
            const isAutoApproval = messSettings?.joinRequestApproval === 'auto';

            const studentRef = doc(db, 'users', user.uid);
            const studentId = `STU${user.uid.slice(-5).toUpperCase()}`;

            const updateData: Partial<Student> = {
                messId: messAdminUid,
                messName: messName,
                status: isAutoApproval ? 'pending_start' : 'pending_approval',
                studentId: studentId,
                joinDate: new Date().toISOString(),
                messPlan: selectedPlan,
            };

            if (!user.originalJoinDate) {
                updateData.originalJoinDate = new Date().toISOString();
            }

            await updateDoc(studentRef, updateData);
            
            // 3. If auto-approved, create a notification for the admin
            if (isAutoApproval) {
                 await addDoc(collection(db, 'notifications'), {
                    studentId: messAdminUid, // Send notification TO the admin
                    messId: messAdminUid,
                    title: 'New Student Joined',
                    message: `${user.name} has automatically joined your mess.`,
                    date: new Date().toISOString(),
                    type: 'general',
                    isRead: false,
                    href: `/admin/students?view=${user.uid}`
                });
                toast({ title: 'Joined Successfully!', description: 'Your plan is ready to be activated.' });
                router.push('/student/start-mess');
            } else {
                toast({ title: 'Request Sent!', description: 'Your join request is pending admin approval.' });
                router.push('/student/select-mess?tab=requests');
            }

        } catch (error: any) {
            console.error("Error submitting join request:", error);
            if (error.code === 'permission-denied') {
                 toast({ variant: 'destructive', title: 'Permission Error', description: 'Your request was blocked by security rules. Please try again or contact support.' });
            } else {
                toast({ variant: 'destructive', title: 'Request Failed', description: 'An unknown server error occurred. Please try again later.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!messAdminUid || !messName) {
        return (
             <Card className="w-full max-w-md z-10"><CardContent className="p-6 text-center text-destructive">Invalid Mess Information. Please go back and select a mess.</CardContent></Card>
        )
    }

    return (
        <Card className="w-full max-w-lg z-10 animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader className="text-center">
                <CardTitle>Join "{messName}"</CardTitle>
                <CardDescription>Select your desired meal plan and enter the secret code to join.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label className="font-semibold">Choose Your Meal Plan</Label>
                        <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as Student['messPlan'])} className="grid grid-cols-3 gap-4">
                             <Label htmlFor="full_day" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal transition-all h-32", selectedPlan === 'full_day' ? 'border-primary bg-primary/10' : 'border-muted bg-popover hover:bg-accent')}>
                                <RadioGroupItem value="full_day" id="full_day" className="sr-only" />
                                <Utensils className="mb-2 h-7 w-7 text-primary" />
                                <span className="font-semibold">Full Day</span>
                                <p className="text-xs text-muted-foreground mt-1">Lunch & Dinner</p>
                            </Label>
                             <Label htmlFor="lunch_only" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal transition-all h-32", selectedPlan === 'lunch_only' ? 'border-primary bg-primary/10' : 'border-muted bg-popover hover:bg-accent')}>
                                <RadioGroupItem value="lunch_only" id="lunch_only" className="sr-only" />
                                <Sun className="mb-2 h-7 w-7 text-yellow-400" />
                                 <span className="font-semibold">Lunch Only</span>
                                 <p className="text-xs text-muted-foreground mt-1">Only Lunch</p>
                            </Label>
                             <Label htmlFor="dinner_only" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 p-4 font-normal transition-all h-32", selectedPlan === 'dinner_only' ? 'border-primary bg-primary/10' : 'border-muted bg-popover hover:bg-accent')}>
                                <RadioGroupItem value="dinner_only" id="dinner_only" className="sr-only" />
                                <Moon className="mb-2 h-7 w-7 text-purple-400" />
                                <span className="font-semibold">Dinner Only</span>
                                <p className="text-xs text-muted-foreground mt-1">Only Dinner</p>
                            </Label>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="secretCode" className="font-semibold">Enter Secret Code</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="secretCode"
                                name="secretCode"
                                type="text"
                                placeholder="••••"
                                required
                                maxLength={4}
                                className="pl-9 font-mono tracking-[0.5em] text-center"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting || !selectedPlan || secretCode.length !== 4}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="ml-2" />}
                      {isSubmitting ? 'Submitting...' : 'Submit Join Request'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function JoinMessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <JoinMessContent />
            </Suspense>
        </main>
    )
}

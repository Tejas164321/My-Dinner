
'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { updateDoc, doc, getDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';

function JoinMessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const messAdminUid = searchParams.get('messId'); 
    const messName = searchParams.get('messName');

    const [secretCode, setSecretCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!user || !messAdminUid || !messName) {
            toast({ variant: 'destructive', title: 'Error', description: 'User or mess information is missing.' });
            setIsSubmitting(false);
            return;
        }

        if (!secretCode || secretCode.length !== 4) {
             toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a 4-digit secret code.' });
             setIsSubmitting(false);
             return;
        }

        try {
            // 1. Fetch the admin's user document to validate the secret code.
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

            const studentRef = doc(db, 'users', user.uid);
            const historicalDocId = `${messAdminUid}_${user.uid}`;
            const historicalDocRef = doc(db, 'suspended_students', historicalDocId);
            const historicalDocSnap = await getDoc(historicalDocRef);
            
            const batch = writeBatch(db);

            if (historicalDocSnap.exists()) {
                // Student is rejoining, restore their historical data.
                const historicalData = historicalDocSnap.data() as Student;
                
                // **RE-IMPLEMENTED LOGIC**
                // Create a clean object and manually map only the required fields.
                // This prevents writing incompatible data like old Timestamps.
                const updateData: Partial<Student> = {
                    messId: messAdminUid,
                    messName: messName,
                    status: 'pending_approval',
                    joinDate: new Date().toISOString(),
                    messPlan: historicalData.messPlan || 'full_day',
                    // Restore essential historical fields
                    studentId: historicalData.studentId,
                    originalJoinDate: historicalData.originalJoinDate,
                    contact: historicalData.contact || '',
                    roomNo: historicalData.roomNo || '',
                    // Ensure these are nulled out on rejoin
                    planStartDate: null,
                    planStartMeal: null,
                    leaveDate: null,
                };

                batch.update(studentRef, updateData);
                // Delete the historical record as they are now active again.
                batch.delete(historicalDocRef);
            } else {
                // This is a completely new student for this mess.
                const studentId = `STU${user.uid.slice(-5).toUpperCase()}`;
                const updateData: Partial<Student> = {
                    messId: messAdminUid,
                    messName: messName,
                    status: 'pending_approval',
                    studentId: studentId,
                    joinDate: new Date().toISOString(),
                    messPlan: 'full_day',
                };
                 // Only set originalJoinDate if it doesn't already exist
                if (!user.originalJoinDate) {
                    updateData.originalJoinDate = new Date().toISOString();
                }

                batch.update(studentRef, updateData);
            }
            
            await batch.commit();

            toast({ title: 'Request Sent!', description: 'Your join request is pending admin approval.' });
            router.push('/student/select-mess?tab=requests');

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
        <Card className="w-full max-w-md z-10 animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader className="text-center">
                <CardTitle>Join "{messName}"</CardTitle>
                <CardDescription>Enter the 4-digit secret code provided by the mess admin.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="secretCode">Secret Code</Label>
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
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
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

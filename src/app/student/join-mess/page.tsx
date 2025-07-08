
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { submitJoinRequest } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isSubmitting;
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="ml-2" />}
      {isLoading ? 'Submitting...' : 'Submit Join Request'}
    </Button>
  );
}

function JoinMessContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const messId = searchParams.get('messId');
    const messName = searchParams.get('messName');
    
    const [state, formAction] = useFormState(submitJoinRequest, { success: false, error: undefined });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (state.success && user && messId && messName && !isSubmitting) {
            const updateUserStatus = async () => {
                setIsSubmitting(true);
                try {
                    const studentId = `STU${user.uid.slice(-5).toUpperCase()}`;
                    const studentRef = doc(db, 'users', user.uid);
                    await updateDoc(studentRef, {
                        messId: messId,
                        messName: messName,
                        status: 'pending_approval',
                        studentId: studentId,
                        joinDate: new Date().toISOString().split('T')[0],
                        messPlan: 'full_day'
                    });
                    // The onSnapshot listener in AuthProvider will handle the state update
                    // and the layout will redirect to the pending approval screen.
                    toast({ title: 'Request Sent!', description: 'Your join request is pending admin approval.' });
                } catch (error) {
                    console.error("Error updating user status:", error);
                    toast({ variant: 'destructive', title: 'Update Failed', description: "Could not update your profile. Please contact support." });
                    setIsSubmitting(false); // Reset on failure
                }
            };
            updateUserStatus();
        } else if (state.error) {
            toast({ variant: 'destructive', title: 'Request Failed', description: state.error });
        }
    }, [state, user, messId, messName, toast, isSubmitting]);

    if (!messId || !messName) {
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
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="messId" value={messId || ''} />
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
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} />
                </form>
            </CardContent>
        </Card>
    );
}

export default function JoinMessPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
            <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <Suspense fallback={<div>Loading...</div>}>
                <JoinMessContent />
            </Suspense>
        </main>
    )
}

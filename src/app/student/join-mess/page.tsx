'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitJoinRequest } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Send } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Join Request'}
      <Send className="ml-2" />
    </Button>
  );
}

function JoinMessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const messId = searchParams.get('messId');
    const messName = searchParams.get('messName');
    
    const submitJoinRequestWithParams = submitJoinRequest.bind(null, user?.uid || '', messId || '');
    const [state, formAction] = useFormState(submitJoinRequestWithParams, { success: false });

    useEffect(() => {
        if (state.success) {
            toast({ title: 'Request Sent!', description: 'Your join request is pending admin approval.' });
            router.replace('/student/dashboard');
        } else if (state.error) {
            toast({ variant: 'destructive', title: 'Request Failed', description: state.error });
        }
    }, [state, router, toast]);

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
                            />
                        </div>
                    </div>
                    <SubmitButton />
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

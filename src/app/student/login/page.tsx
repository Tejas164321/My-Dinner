
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { studentLogin } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChefHat, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : 'Log In'}
      <LogIn className="ml-2" />
    </Button>
  );
}

export default function StudentLoginPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(studentLogin, { success: false });

  useEffect(() => {
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: state.error });
    }
  }, [state, toast]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="glow-effect-1"></div>
      <div className="glow-effect-2"></div>
      <Card className="w-full max-w-md z-10 animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full border border-primary/20 bg-primary/10 p-3 shadow-lg">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
          <CardTitle>Student Portal</CardTitle>
          <CardDescription>Log in to access your mess dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="student@university.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/student/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

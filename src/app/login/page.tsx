'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { studentLogin } from '@/app/auth/actions';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChefHat } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export default function StudentLoginPage() {
  const [state, formAction] = useFormState(studentLogin, { message: '' });
  const router = useRouter();
  const { user, loading } = useAuth();
  
   useEffect(() => {
    // This effect handles redirecting a user who is already logged in
    if (!loading && user?.role === 'student') {
      router.replace('/student/dashboard');
    }
  }, [user, loading, router]);


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="glow-effect-1"></div>
      <div className="glow-effect-2"></div>
      
      <div className="z-10 w-full max-w-md animate-in fade-in-0 slide-in-from-top-12 duration-1000">
        <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
                <div className="rounded-full border border-primary/20 bg-primary/10 p-3 shadow-lg">
                    <ChefHat className="h-8 w-8 text-primary" />
                </div>
            </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="student@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              {state.message && state.message !== 'success' && (
                 <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
              
              <SubmitButton />
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-primary">
                Sign up
              </Link>
            </div>
             <div className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/admin/login" className="underline">
                    Admin Login
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

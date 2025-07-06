'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { studentSignup } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChefHat } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create Account'}
    </Button>
  );
}

export default function StudentSignupPage() {
  const [state, formAction] = useFormState(studentSignup, { message: null });

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

        {state?.message === 'success' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Request Submitted!</CardTitle>
              <CardDescription className="text-center pt-2">
                Your account has been created and is now pending admin approval. You will be able to log in once it's reviewed.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create a Student Account</CardTitle>
              <CardDescription>Enter your details to join the mess. Admin approval will be required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" name="studentId" placeholder="e.g., B12345" required />
                  </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input id="contact" name="contact" type="tel" placeholder="+91 1234567890" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomNo">Room No.</Label>
                    <Input id="roomNo" name="roomNo" placeholder="e.g. H-404" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                
                {state?.message && (
                   <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Signup Failed</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
                )}
                
                <SubmitButton />
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline text-primary">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

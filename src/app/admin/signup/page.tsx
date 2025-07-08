
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { adminSignup } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create Admin Account'}
      <UserPlus className="ml-2" />
    </Button>
  );
}

export default function AdminSignupPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(adminSignup, { success: false });

  useEffect(() => {
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: state.error });
    }
  }, [state, toast]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
       <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Card className="w-full max-w-md z-10 animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <CardTitle>Create Admin Account</CardTitle>
          <CardDescription>Enter your details to register your mess.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="messName">Mess Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="messName" name="messName" placeholder="e.g., Central Kitchen" required className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/admin/login" className="underline text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

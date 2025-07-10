
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppUser } from '@/lib/data';

export default function StudentSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: 'All fields are required.' });
      setIsLoading(false);
      return;
    }
     if (password.length < 6) {
        toast({ variant: 'destructive', title: 'Signup Failed', description: 'Password must be at least 6 characters long.' });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newStudent: Partial<AppUser> = {
            uid: user.uid,
            name,
            email,
            role: 'student',
            status: 'unaffiliated',
            avatarUrl: `https://avatar.vercel.sh/${email}.png`,
        };
        
        await setDoc(doc(db, 'users', user.uid), newStudent);

        toast({ title: 'Account Created!', description: 'Please log in to continue.' });
        router.push('/student/login');

    } catch (error: any) {
        let errorMessage = 'An unknown error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered.';
        }
        toast({ variant: 'destructive', title: 'Signup Failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Card className="w-full max-w-md z-10 animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <CardTitle>Create Student Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="student@university.edu" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="ml-2" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/student/login" className="underline text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

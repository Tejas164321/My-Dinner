'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCog, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppUser } from '@/lib/data';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Email and password are required.' });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data()?.role === 'admin') {
        toast({ title: 'Login Successful!' });
        router.push('/admin/dashboard');
      } else {
        await signOut(auth); // Sign out the user if they are not an admin
        toast({ variant: 'destructive', title: 'Access Denied', description: 'This account does not have admin privileges.' });
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = "Invalid credentials. Please check your email and password.";
      }
      toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="glow-effect-1"></div>
      <div className="glow-effect-2"></div>
      <Card className="w-full max-w-md z-10 animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full border border-primary/20 bg-primary/10 p-3 shadow-lg">
              <UserCog className="h-10 w-10 text-primary" />
            </div>
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>Log in to manage your mess.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an admin account?{' '}
            <Link href="/admin/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

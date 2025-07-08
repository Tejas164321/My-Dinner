
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppUser } from '@/lib/data';

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [messName, setMessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password || !messName) {
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
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const secretCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // 2. Prepare to write to Firestore
      const adminUserRef = doc(db, 'users', user.uid);
      const messRef = doc(db, 'messes', user.uid);

      const newAdmin: AppUser = {
        uid: user.uid,
        name,
        email,
        role: 'admin',
        messName,
        secretCode,
        status: 'active',
        avatarUrl: `https://avatar.vercel.sh/${email}.png`
      };
      
      const newMess = {
          messName: messName,
          adminUid: user.uid
      };

      // 3. Use a batch write to create both documents atomically
      const batch = writeBatch(db);
      batch.set(adminUserRef, newAdmin);
      batch.set(messRef, newMess);
      await batch.commit();

      toast({ title: 'Account Created!', description: 'Please log in to continue.' });
      router.push('/admin/login');

    } catch (error: any) {
      let errorMessage = 'An unknown error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. It must be at least 6 characters long.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to perform this action. Check Firestore rules.';
      }
      console.error("Admin Signup Error:", error);
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
          <CardTitle>Create Admin Account</CardTitle>
          <CardDescription>Enter your details to register your mess.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="messName">Mess Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="messName" name="messName" placeholder="e.g., Central Kitchen" required className="pl-9" value={messName} onChange={e => setMessName(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="ml-2" />}
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
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

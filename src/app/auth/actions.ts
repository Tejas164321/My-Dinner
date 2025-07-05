'use server';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function studentSignup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const studentId = formData.get('studentId') as string;
  const contact = formData.get('contact') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      studentId,
      contact,
      role: 'student',
      joinDate: new Date().toISOString().split('T')[0],
      messPlan: 'full_day',
      status: 'active'
    });

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        return { message: 'This email is already registered. Please login.' };
    }
    return { message: error.message };
  }
  
  revalidatePath('/');
  redirect('/student/dashboard');
}

export async function studentLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            return { message: 'Invalid email or password.' };
        }
        return { message: 'An unexpected error occurred. Please try again.' };
    }
    
    // AuthProvider will handle redirection based on role
    return { message: 'success' };
}

export async function adminSignup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role: 'admin',
      avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
    });

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        return { message: 'This email is already registered. Please login.' };
    }
    return { message: error.message };
  }
  
  revalidatePath('/');
  redirect('/admin');
}


export async function adminLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            return { message: 'Invalid email or password.' };
        }
        return { message: 'An unexpected error occurred. Please try again.' };
    }
    
    // AuthProvider will handle redirection based on role
    return { message: 'success' };
}


export async function logout() {
    await auth.signOut();
    redirect('/login');
}

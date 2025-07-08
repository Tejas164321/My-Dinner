
'use server';

import { redirect } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser } from '@/lib/data';

interface ActionResult {
  success: boolean;
  error?: string;
  userStatus?: AppUser['status'];
}

// --- Student Actions ---

export async function studentSignup(prevState: any, formData: FormData): Promise<ActionResult> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { success: false, error: 'All fields are required.' };
    }
     if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
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

    } catch (error: any) {
         if (error.code === 'auth/email-already-in-use') {
            return { success: false, error: 'This email is already registered.' };
        }
        return { success: false, error: 'An unknown error occurred. Please try again.' };
    }
    
    redirect('/student/login');
}


// --- Admin Actions ---

export async function adminSignup(prevState: any, formData: FormData): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const messName = formData.get('messName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password || !messName) {
      return { success: false, error: 'All fields are required.' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Password is too weak. It must be at least 6 characters long.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const secretCode = Math.floor(1000 + Math.random() * 9000).toString();

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

    await setDoc(doc(db, 'users', user.uid), newAdmin);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: 'This email is already registered.' };
    }
     if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Password is too weak. It must be at least 6 characters long.' };
    }
    console.error("Admin Signup Error:", error);
    return { success: false, error: 'An unknown error occurred. Please try again.' };
  }
  
  redirect('/admin/login');
}

// --- Universal Logout Action ---
export async function logout(): Promise<ActionResult> {
  try {
    await signOut(auth);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
  redirect('/');
}


'use server';

import { redirect } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
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
    
    return { success: true };
}


// --- Admin Actions ---
// This server action is no longer used for signup. The logic has been moved to the client-side
// in src/app/admin/signup/page.tsx to handle authenticated Firestore writes correctly.

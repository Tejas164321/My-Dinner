'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Student, AppUser } from '@/lib/data';

// --- Shared Types ---
interface ActionResult {
  success: boolean;
  error?: string;
}

// --- Student Actions ---

export async function studentLogin(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists() || userDoc.data()?.role !== 'student') {
        await signOut(auth);
        return { success: false, error: 'Access denied. Not a valid student account.' };
    }

    return { success: true };
  } catch (error: any) {
    // Firebase provides descriptive error messages (e.g., auth/invalid-credential)
    // that are safe to show to the user.
    return { success: false, error: error.message };
  }
}

export async function studentSignup(formData: FormData): Promise<ActionResult> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const studentId = formData.get('studentId') as string;
    const contact = formData.get('contact') as string;
    const roomNo = formData.get('roomNo') as string;

    if (!name || !email || !password || !studentId || !contact || !roomNo) {
        return { success: false, error: 'All fields are required.' };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newStudent: Omit<Student, 'uid' | 'id'> = {
            name,
            email,
            studentId,
            contact,
            roomNo,
            role: 'student',
            messPlan: 'full_day',
            status: 'pending', // Admins must approve new students
            joinDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
            avatarUrl: `https://avatar.vercel.sh/${email}.png`,
        };
        
        await setDoc(doc(db, 'users', user.uid), newStudent);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Admin Actions ---

export async function adminLogin(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    // Security check: ensure the user exists in Firestore and has the 'admin' role
    if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
      await signOut(auth); // Sign out the user immediately if they are not a valid admin
      return { success: false, error: 'Access denied. Not a valid admin account.' };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminSignup(formData: FormData): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const secretCode = formData.get('secretCode') as string;

  // In a real app, this secret code would be stored securely in your database
  // or as a secret environment variable.
  if (secretCode !== '1234') {
    return { success: false, error: 'Invalid secret code for admin signup.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newAdmin: AppUser = {
      uid: user.uid,
      name,
      email,
      role: 'admin',
      status: 'active', // Admins are active immediately
      avatarUrl: `https://avatar.vercel.sh/${email}.png`
    };

    await setDoc(doc(db, 'users', user.uid), newAdmin);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Universal Logout Action ---
export async function logout(): Promise<ActionResult> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

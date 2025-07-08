
'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser } from '@/lib/data';

interface ActionResult {
  success: boolean;
  error?: string;
  status?: AppUser['status'];
}

// --- Student Actions ---

export async function studentLogin(prevState: any, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userDoc.exists() || userData?.role !== 'student') {
        await signOut(auth);
        return { success: false, error: 'Access denied. Not a valid student account.' };
    }

    return { success: true, status: userData?.status };
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, error: "Invalid credentials. Please try again." };
    }
    return { success: false, error: "An unknown error occurred. Please try again." };
  }
}

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
        // This automatically signs the user in
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

        return { success: true, status: 'unaffiliated' };
    } catch (error: any) {
         if (error.code === 'auth/email-already-in-use') {
            return { success: false, error: 'This email is already registered.' };
        }
        return { success: false, error: 'An unknown error occurred. Please try again.' };
    }
}

export async function submitJoinRequest(studentUid: string, messId: string, prevState: any, formData: FormData): Promise<ActionResult> {
    const secretCode = formData.get('secretCode') as string;

    if (!studentUid || !messId || !secretCode) {
        return { success: false, error: 'Missing information. Please try again.' };
    }

    try {
        const messAdminRef = doc(db, 'users', messId);
        const messAdminDoc = await getDoc(messAdminRef);

        if (!messAdminDoc.exists() || !messAdminDoc.data()?.secretCode) {
            return { success: false, error: 'Invalid mess selected.' };
        }

        if (messAdminDoc.data()?.secretCode !== secretCode) {
            return { success: false, error: 'The secret code is incorrect.' };
        }
        
        const studentId = `STU${studentUid.slice(-5).toUpperCase()}`;

        const studentRef = doc(db, 'users', studentUid);
        await updateDoc(studentRef, {
            messId: messId,
            messName: messAdminDoc.data()?.messName || 'Unnamed Mess',
            status: 'pending_approval',
            studentId: studentId,
            joinDate: new Date().toISOString().split('T')[0],
            messPlan: 'full_day'
        });
        
        return { success: true };

    } catch (error) {
        console.error("Error submitting join request: ", error);
        return { success: false, error: 'A server error occurred. Please try again later.' };
    }
}

export async function cancelJoinRequest(userId: string): Promise<ActionResult> {
  if (!userId) {
    return { success: false, error: 'User ID is missing.' };
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'unaffiliated',
      messId: null,
      messName: null,
      studentId: null,
      joinDate: null,
      messPlan: null,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling join request:", error);
    return { success: false, error: 'Failed to cancel request.' };
  }
}

// --- Admin Actions ---

export async function adminLogin(prevState: any, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
      await signOut(auth);
      return { success: false, error: 'Access denied. Not a valid admin account.' };
    }
    
    return { success: true };
  } catch (error: any) {
     if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, error: "Invalid credentials. Please try again." };
    }
    return { success: false, error: 'An unknown error occurred. Please try again.' };
  }
}

export async function adminSignup(prevState: any, formData: FormData): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const messName = formData.get('messName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password || !messName) {
      return { success: false, error: 'All fields are required.' };
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
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: 'This email is already registered.' };
    }
    return { success: false, error: 'An unknown error occurred. Please try again.' };
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

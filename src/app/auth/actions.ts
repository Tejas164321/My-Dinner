'use server';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function studentSignup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const studentId = formData.get('studentId') as string;
  const contact = formData.get('contact') as string;
  const roomNo = formData.get('roomNo') as string;

  if (!name || !email || !password || !studentId || !contact || !roomNo) {
      return { message: 'All fields are required.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      studentId,
      contact,
      roomNo,
      role: 'student',
      status: 'pending', // Student is pending approval by admin
      messPlan: 'full_day',
      joinDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
    });

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        return { message: 'This email is already registered. Please login.' };
    }
    return { message: `An unexpected error occurred: ${error.message}` };
  }
  
  return { message: 'success' };
}

export async function studentLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    let userCredential;

    try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            return { message: 'Invalid email or password.' };
        }
        return { message: `An unexpected error occurred: ${error.message}` };
    }
    
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role !== 'student') {
            await auth.signOut();
            return { message: 'This is not a valid student account. Use the admin portal if you are an admin.' };
        }
        if (userData.status === 'pending') {
            await auth.signOut();
            return { message: 'Your account is pending approval from the mess admin.' };
        }
        if (userData.status === 'suspended') {
            await auth.signOut();
            return { message: 'Your account has been suspended. Please contact the mess admin.' };
        }
    } else {
        await auth.signOut();
        return { message: 'User data not found. Please contact support.' };
    }
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
  return { message: 'success' };
}


export async function adminLogin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  let userCredential: UserCredential | undefined;

  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' && email === 'admin@messo.com') {
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        await setDoc(doc(db, 'users', newUser.uid), {
          name: 'Admin User',
          email: email,
          role: 'admin',
          avatarUrl: `https://i.pravatar.cc/150?u=${newUser.uid}`,
        });
      } catch (createError: any) {
        return { message: `Failed to create default admin account: ${createError.message}` };
      }
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      return { message: 'Invalid email or password.' };
    } else {
      return { message: `An unexpected error occurred: ${error.message}` };
    }
  }

  if (userCredential) {
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        return { message: 'success' };
    } else {
      await auth.signOut();
      return { message: 'This account does not have admin privileges.' };
    }
  }
  
  return { message: 'An unexpected error occurred during user verification.' };
}


export async function logout() {
    await auth.signOut();
}

'use server';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

    if (userDocSnap.exists() && userDocSnap.data().role === 'student') {
        redirect('/student/dashboard');
    } else {
        await auth.signOut();
        return { message: 'This is not a valid student account. Please use the admin portal if you are an admin.' };
    }
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
  let userCredential: UserCredential | undefined;

  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // If sign-in fails, check if it's the special admin user case
    if (error.code === 'auth/user-not-found' && email === 'admin@messo.com') {
      // This is the first run for the default admin, so create it
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
      // For any other sign-in error, return the message.
      return { message: `An unexpected error occurred: ${error.message}` };
    }
  }

  // At this point, userCredential should be populated either from sign-in or creation.
  if (userCredential) {
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
      redirect('/admin');
    } else {
      // This case handles if a non-admin user tries to log in through the admin portal.
      await auth.signOut();
      return { message: 'This account does not have admin privileges.' };
    }
  }
  
  // This is a fallback, should not be reached in normal flow.
  return { message: 'An unexpected error occurred during user verification.' };
}


export async function logout() {
    await auth.signOut();
    redirect('/login');
}

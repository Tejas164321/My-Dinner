'use server';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
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
    return { message: error.message };
  }
  
  revalidatePath('/');
  redirect('/student/dashboard');
}


export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        // If login fails because the user doesn't exist, and it's the admin user, create it.
        if (error.code === 'auth/invalid-credential' && email === 'admin@messo.com') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Create the admin user document in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    name: 'Admin User',
                    email: user.email,
                    role: 'admin',
                    avatarUrl: 'https://i.pravatar.cc/150?u=admin01',
                });
                
                // Since user is now created and logged in, we can proceed.
                revalidatePath('/');
                return { message: 'success' };
            } catch (creationError: any) {
                // If creation fails (e.g., weak password), return that error.
                return { message: `Admin creation failed: ${creationError.message}` };
            }
        }
        
        if (error.code === 'auth/invalid-credential') {
            return { message: 'Invalid email or password.' };
        }
        return { message: 'An unexpected error occurred. Please try again.' };
    }
    
    revalidatePath('/');
    // Redirection will be handled by the client-side AuthProvider logic
    return { message: 'success' }
}


export async function logout() {
    await auth.signOut();
    redirect('/login');
}

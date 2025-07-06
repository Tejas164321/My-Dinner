'use server';

import { collection, doc, writeBatch, deleteDoc, updateDoc, getDoc, serverTimestamp, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const USERS_COLLECTION = 'users';
const JOIN_REQUESTS_COLLECTION = 'joinRequests';
const PLAN_CHANGE_REQUESTS_COLLECTION = 'planChangeRequests';


export async function submitJoinRequest(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const studentId = formData.get('studentId') as string;
  const contact = formData.get('contact') as string;
  const roomNo = formData.get('roomNo') as string;

  // Basic validation
  if (!name || !email || !studentId || !contact || !roomNo) {
    return { message: 'All fields are required.' };
  }

  try {
    // Check if a user with this email or student ID already exists
    const emailQuery = query(collection(db, USERS_COLLECTION), where("email", "==", email), limit(1));
    const studentIdQuery = query(collection(db, USERS_COLLECTION), where("studentId", "==", studentId), limit(1));
    
    const [emailSnapshot, studentIdSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(studentIdQuery)]);

    if (!emailSnapshot.empty) {
        return { message: 'A user with this email already exists.' };
    }
    if (!studentIdSnapshot.empty) {
        return { message: 'A user with this Student ID already exists.' };
    }

    await addDoc(collection(db, JOIN_REQUESTS_COLLECTION), {
      name,
      email,
      studentId,
      contact,
      roomNo,
      date: new Date().toISOString(),
    });

  } catch (error: any) {
    return { message: `An unexpected error occurred: ${error.message}` };
  }

  revalidatePath('/admin/students');
  return { message: 'success' };
}

export async function approveJoinRequest(requestId: string, requestData: Omit<Student, 'id' | 'joinDate' | 'status' | 'messPlan'>) {
    const userRef = doc(collection(db, USERS_COLLECTION));
    const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);

    const newStudent: Omit<Student, 'id'> = {
        ...requestData,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        messPlan: 'full_day',
    };

    const batch = writeBatch(db);
    batch.set(userRef, newStudent);
    batch.delete(requestRef);
    
    await batch.commit();
    revalidatePath('/admin/students');
}

export async function rejectJoinRequest(requestId: string) {
    const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
    await deleteDoc(requestRef);
    revalidatePath('/admin/students');
}

export async function submitPlanChangeRequest(studentId: string, studentName: string, fromPlan: Student['messPlan'], toPlan: Student['messPlan']) {
    await addDoc(collection(db, PLAN_CHANGE_REQUESTS_COLLECTION), {
        studentId,
        studentName,
        fromPlan,
        toPlan,
        date: new Date().toISOString(),
    });
    revalidatePath('/admin/students');
}

export async function approvePlanChangeRequest(requestId: string, studentId: string, toPlan: Student['messPlan']) {
    const userQuery = query(collection(db, USERS_COLLECTION), where("studentId", "==", studentId), limit(1));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
        throw new Error("Student not found to approve plan change.");
    }
    
    const userDoc = userSnapshot.docs[0];
    const userRef = doc(db, USERS_COLLECTION, userDoc.id);
    const requestRef = doc(db, PLAN_CHANGE_REQUESTS_COLLECTION, requestId);

    const batch = writeBatch(db);
    batch.update(userRef, { messPlan: toPlan });
    batch.delete(requestRef);

    await batch.commit();
    revalidatePath('/admin/students');
}

export async function rejectPlanChangeRequest(requestId: string) {
    const requestRef = doc(db, PLAN_CHANGE_REQUESTS_COLLECTION, requestId);
    await deleteDoc(requestRef);
    revalidatePath('/admin/students');
}

export async function suspendStudent(studentDocId: string) {
    const userRef = doc(db, USERS_COLLECTION, studentDocId);
    await updateDoc(userRef, { status: 'suspended' });
    revalidatePath('/admin/students');
}

export async function reactivateStudent(studentDocId: string) {
    const userRef = doc(db, USERS_COLLECTION, studentDocId);
    await updateDoc(userRef, { status: 'active' });
    revalidatePath('/admin/students');
}

export async function deleteStudent(studentDocId: string) {
    const userRef = doc(db, USERS_COLLECTION, studentDocId);
    await deleteDoc(userRef);
    revalidatePath('/admin/students');
}

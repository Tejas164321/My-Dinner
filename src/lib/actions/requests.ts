'use server';

import { collection, doc, writeBatch, deleteDoc, updateDoc, getDoc, serverTimestamp, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const USERS_COLLECTION = 'users';
const PLAN_CHANGE_REQUESTS_COLLECTION = 'planChangeRequests';

export async function approveStudent(userId: string) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { status: 'active' });
    revalidatePath('/admin/students');
}

export async function rejectStudent(userId: string) {
    // Note: This only deletes the Firestore user record. For a production app,
    // you would also need to delete the user from Firebase Authentication using the Admin SDK,
    // which is outside the scope of this implementation.
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
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

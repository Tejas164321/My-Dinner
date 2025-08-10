
'use server';

import { doc, updateDoc, getDoc, setDoc, writeBatch, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppUser } from '../data';

/**
 * Handles a student voluntarily leaving a mess.
 * This moves their current user data to a historical collection and
 * resets their main user document to an 'unaffiliated' state.
 * @param studentUid The UID of the student leaving the mess.
 */
export async function leaveMessAction(studentUid: string): Promise<void> {
    if (!studentUid) {
        throw new Error("Student UID is required to leave the mess.");
    }
    
    const userRef = doc(db, 'users', studentUid);

    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            throw new Error("Student document not found.");
        }
        
        const studentData = userSnap.data() as AppUser;
        
        // This action can be performed regardless of messId, it just resets the user
        const historicalDocRef = doc(db, 'suspended_students', `${studentData.messId || 'unknown'}_${studentUid}`);
        
        const batch = writeBatch(db);

        // 1. Copy the current student data to the historical collection with 'left' status
        // Even if they are already unaffiliated, this captures their last known state.
        if (studentData.messId) {
            batch.set(historicalDocRef, { 
                ...studentData, 
                status: 'left', // Use 'left' status for voluntary leaving
                leaveDate: new Date().toISOString() 
            }, { merge: true });
        }

        // 2. Reset the original user document to an unaffiliated state so they can join another mess
        batch.update(userRef, {
            status: 'unaffiliated',
            messId: null, 
            messName: null,
            planStartDate: null,
            planStartMeal: null,
            studentId: null,
            joinDate: null,
            leaveDate: new Date().toISOString(),
        });

        await batch.commit();

    } catch (error) {
        console.error(`Error during leave mess action for student ${studentUid}:`, error);
        throw new Error("Failed to process leave mess request.");
    }
}

/**
 * Deletes all mess-related data for a student, resetting them to an unaffiliated state
 * without deleting their authentication account.
 * @param student The full student object from the historical collection.
 */
export async function deleteStudentHistory(student: AppUser): Promise<void> {
    if (!student || !student.uid) {
        throw new Error("Valid student data is required.");
    }

    const batch = writeBatch(db);

    // 1. Delete associated data from all relevant collections
    const collectionsToDelete = ['leaves', 'notifications', 'planChangeRequests'];
    for (const collectionName of collectionsToDelete) {
        // Note: Firestore queries for 'studentUid' for consistency.
        const q = query(collection(db, collectionName), where("studentUid", "==", student.uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => batch.delete(doc.ref));
    }
    
     // Also handle collections that use 'studentId'
    const qLeavesById = query(collection(db, 'leaves'), where("studentId", "==", student.uid));
    const leavesSnapshot = await getDocs(qLeavesById);
    leavesSnapshot.forEach(doc => batch.delete(doc.ref));

    const qNotifsById = query(collection(db, 'notifications'), where("studentId", "==", student.uid));
    const notifsSnapshot = await getDocs(qNotifsById);
    notifsSnapshot.forEach(doc => batch.delete(doc.ref));


    // 2. Delete the historical record itself if it exists
    if (student.messId) {
      const historicalDocRef = doc(db, 'suspended_students', `${student.messId}_${student.uid}`);
      batch.delete(historicalDocRef);
    }
    
    // 3. Reset the main user document to an unaffiliated state
    const userRef = doc(db, 'users', student.uid);
    batch.update(userRef, {
        status: 'unaffiliated',
        messId: null,
        messName: null,
        planStartDate: null,
        planStartMeal: null,
        studentId: null,
        joinDate: null,
        originalJoinDate: null,
        leaveDate: new Date().toISOString(),
    });

    await batch.commit();
}

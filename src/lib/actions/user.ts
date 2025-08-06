
'use server';

import { doc, updateDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
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
        if (!studentData.messId) {
            // If there's no messId, they've already left or are unaffiliated.
            // We can just ensure their status is correct.
             await updateDoc(userRef, { 
                status: 'unaffiliated',
                messId: null,
                messName: null,
                planStartDate: null,
                planStartMeal: null,
                studentId: null,
                joinDate: null,
                leaveDate: new Date().toISOString(),
            });
            return;
        }
        
        const historicalDocRef = doc(db, 'suspended_students', `${studentData.messId}_${studentUid}`);
        
        const batch = writeBatch(db);

        // 1. Copy the current student data to the historical collection
        batch.set(historicalDocRef, { 
            ...studentData, 
            status: 'left', 
            leaveDate: new Date().toISOString() 
        });

        // 2. Reset the original user document to an unaffiliated state
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

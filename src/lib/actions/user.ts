'use server';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppUser } from '../data';

/**
 * Handles the "soft delete" of a student leaving a mess.
 * It archives their original join date for historical billing purposes,
 * updates their status, and clears their current mess association.
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
        const userData = userSnap.data() as AppUser;

        // Preserve the first join date for historical billing
        const originalJoinDate = userData.originalJoinDate || userData.joinDate;

        await updateDoc(userRef, { 
            status: 'left',
            messId: null,
            messName: null,
            planStartDate: null,
            planStartMeal: null,
            leaveDate: new Date().toISOString(),
            originalJoinDate: originalJoinDate // Set or keep the original join date
        });
    } catch (error) {
        console.error(`Error during leave mess action for student ${studentUid}:`, error);
        throw new Error("Failed to process leave mess request.");
    }
}

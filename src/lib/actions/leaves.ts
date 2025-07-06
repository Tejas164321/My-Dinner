'use server';

import { collection, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Leave } from '@/lib/data';

const LEAVES_COLLECTION = 'leaves';

// The payload from the client will have the date as an ISO string.
export type LeavePayload = Omit<Leave, 'date' | 'id'> & { date: string };

/**
 * Adds an array of leave objects to Firestore using a batch write.
 */
export async function addLeaves(leaves: LeavePayload[]): Promise<void> {
    try {
        const batch = writeBatch(db);
        
        leaves.forEach(leave => {
            const leaveDocRef = doc(collection(db, LEAVES_COLLECTION));
            const dataToSave = {
                ...leave,
                // Convert ISO string back to a Firestore-compatible Date object
                date: new Date(leave.date), 
            };
            batch.set(leaveDocRef, dataToSave);
        });

        await batch.commit();
    } catch (error) {
        console.error("Error adding leaves to Firestore:", error);
        throw new Error('Failed to save leaves to the database.');
    }
}

/**
 * Deletes a leave from Firestore based on its unique document ID.
 */
export async function deleteLeave(leaveId: string): Promise<void> {
  try {
    if (!leaveId) {
        throw new Error("A valid Leave ID is required for deletion.");
    }
    const docRef = doc(db, LEAVES_COLLECTION, leaveId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting leave:", error);
    throw new Error('Failed to delete leave.');
  }
}

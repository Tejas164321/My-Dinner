
/**
 * @fileoverview This file contains functions for interacting with mess-related
 * data in Firestore, such as fetching mess details. This centralizes data
 * access logic for messes.
 */
'use server';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MESSES_COLLECTION = 'messes';

export interface MessInfo {
  messName: string;
  adminUid: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  perMealCharge?: number;
  joinRequestApproval?: 'manual' | 'auto';
  leaveDeadlineEnabled?: boolean;
  lunchDeadline?: string;
  dinnerDeadline?: string;
}

/**
 * Fetches the details for a specific mess from Firestore.
 * @param messId The UID of the admin, which is the document ID for the mess.
 * @returns The mess information object or null if not found.
 */
export async function getMessInfo(messId: string): Promise<MessInfo | null> {
  if (!messId) return null;
  try {
    const messDocRef = doc(db, MESSES_COLLECTION, messId);
    const docSnap = await getDoc(messDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as MessInfo;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching mess info for ID ${messId}:`, error);
    return null;
  }
}

/**
 * Updates the details for a specific mess in Firestore.
 * @param messId The UID of the admin, which is the document ID for the mess.
 * @param dataToUpdate An object containing the fields to update.
 */
export async function updateMessInfo(messId: string, dataToUpdate: Partial<MessInfo>): Promise<void> {
    if (!messId) throw new Error("A mess ID is required to update information.");
    try {
        const messDocRef = doc(db, MESSES_COLLECTION, messId);
        await updateDoc(messDocRef, dataToUpdate);
    } catch (error) {
        console.error(`Error updating mess info for ID ${messId}:`, error);
        throw new Error("Failed to update mess information.");
    }
}

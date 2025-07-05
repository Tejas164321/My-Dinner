'use server';

import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Holiday } from '@/lib/data';
import { format } from 'date-fns';

const HOLIDAYS_COLLECTION = 'holidays';

/**
 * Fetches all holidays from Firestore.
 */
export async function getHolidays(): Promise<Holiday[]> {
  try {
    const querySnapshot = await getDocs(collection(db, HOLIDAYS_COLLECTION));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Holiday;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error("Error getting holidays:", error);
    return [];
  }
}

/**
 * Adds an array of holiday objects to Firestore.
 * Uses 'YYYY-MM-DD' as the document ID to prevent duplicates.
 */
export async function addHolidays(holidays: Holiday[]): Promise<void> {
  try {
    const batch = holidays.map(holiday => {
      const dateKey = format(holiday.date, 'yyyy-MM-dd');
      const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
      // Firestore handles Date object conversion to Timestamp automatically
      return setDoc(docRef, holiday);
    });
    await Promise.all(batch);
  } catch (error) {
    console.error("Error adding holidays:", error);
    throw new Error('Failed to add holidays.');
  }
}

/**
 * Deletes a holiday from Firestore based on its date.
 */
export async function deleteHoliday(date: Date): Promise<void> {
  try {
    const dateKey = format(date, 'yyyy-MM-dd');
    const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting holiday:", error);
    throw new Error('Failed to delete holiday.');
  }
}

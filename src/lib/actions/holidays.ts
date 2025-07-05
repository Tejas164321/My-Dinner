'use server';

import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Holiday } from '@/lib/data';
import { format } from 'date-fns';

const HOLIDAYS_COLLECTION = 'holidays';

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

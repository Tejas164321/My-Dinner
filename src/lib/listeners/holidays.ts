'use client';

import { collection, onSnapshot, query, Timestamp, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Holiday } from '@/lib/data';

const HOLIDAYS_COLLECTION = 'holidays';

/**
 * Sets up a real-time listener for ALL holiday updates.
 * This is a client-side function.
 * @param callback The function to call with the updated holidays list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onHolidaysUpdate(callback: (holidays: Holiday[]) => void) {
  const q = query(
      collection(db, HOLIDAYS_COLLECTION),
      orderBy("date", "asc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const holidays = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Holiday;
    });
    callback(holidays);
  }, (error) => {
    console.error("Error listening to holiday updates:", error);
    callback([]); 
  });

  return unsubscribe;
}

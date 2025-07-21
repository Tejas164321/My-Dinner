
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
export function onHolidaysUpdate(callback: (holidays: Holiday[]) => void): () => void;
/**
 * Sets up a real-time listener for holiday updates for a specific mess.
 * This is a client-side function.
 * @param messId The ID of the mess to fetch holidays for.
 * @param callback The function to call with the updated holidays list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onHolidaysUpdate(messId: string, callback: (holidays: Holiday[]) => void): () => void;
export function onHolidaysUpdate(arg1: string | ((holidays: Holiday[]) => void), arg2?: (holidays: Holiday[]) => void) {
  let q;
  const callback = typeof arg1 === 'function' ? arg1 : arg2!;
  
  if (typeof arg1 === 'string') {
    // Overload for specific messId
    q = query(
        collection(db, HOLIDAYS_COLLECTION),
        where("messId", "==", arg1),
        orderBy("date", "asc")
    );
  } else {
    // Original overload for all holidays
     q = query(
        collection(db, HOLIDAYS_COLLECTION),
        orderBy("date", "asc")
    );
  }

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

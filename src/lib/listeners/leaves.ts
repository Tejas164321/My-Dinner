'use client';

import { collection, onSnapshot, query, Timestamp, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Leave } from '@/lib/data';

const LEAVES_COLLECTION = 'leaves';

/**
 * Sets up a real-time listener for a specific student's leave updates.
 * @param studentId The UID of the student to fetch leaves for.
 * @param callback The function to call with the updated leaves list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onLeavesUpdate(studentId: string, callback: (leaves: Leave[]) => void) {
  const q = query(
    collection(db, LEAVES_COLLECTION), 
    where("studentId", "==", studentId),
    orderBy("date", "asc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const leaves = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Leave;
    });
    callback(leaves);
  }, (error) => {
    console.error(`Error listening to leaves for student ${studentId}:`, error);
    // On error, return an empty list to prevent crashes.
    callback([]); 
  });

  return unsubscribe;
}

/**
 * Sets up a real-time listener for ALL leave updates. (For Admin use)
 * @param callback The function to call with the updated list of all leaves.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onAllLeavesUpdate(callback: (leaves: Leave[]) => void) {
  const q = query(
    collection(db, LEAVES_COLLECTION),
    orderBy("date", "asc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const leaves = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Leave;
    });
    callback(leaves);
  }, (error) => {
    console.error("Error listening to all leave updates:", error);
    callback([]);
  });

  return unsubscribe;
}

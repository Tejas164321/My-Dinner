
'use client';

import { collection, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';

const USERS_COLLECTION = 'users';
const SUSPENDED_STUDENTS_COLLECTION = 'suspended_students';

/**
 * Sets up a real-time listener for active and pending students for a specific mess.
 * @param messId The UID of the admin/mess to fetch users for.
 * @param callback The function to call with the updated users list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onUsersUpdate(messId: string, callback: (users: Student[]) => void): Unsubscribe {
  if (!messId) {
    console.warn("onUsersUpdate called without a messId.");
    callback([]);
    return () => {}; // Return an empty unsubscribe function
  }

  const q = query(
    collection(db, USERS_COLLECTION),
    where("role", "==", "student"),
    where("messId", "==", messId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Student));
    
    users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(users);

  }, (error) => {
    console.error("Error listening to user updates for messId " + messId, error);
    callback([]);
  });

  return unsubscribe;
}


/**
 * Sets up a real-time listener for historical (suspended or left) students of a mess.
 * @param messId The UID of the admin/mess to fetch users for.
 * @param callback The function to call with the historical users list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onHistoricalUsersUpdate(messId: string, callback: (users: Student[]) => void): Unsubscribe {
  if (!messId) {
    console.warn("onHistoricalUsersUpdate called without a messId.");
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, SUSPENDED_STUDENTS_COLLECTION),
    where("messId", "==", messId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      // **CRITICAL FIX**: Explicitly map the firestore document ID to the 'id' field.
      // The student's auth ID is already present in the data as 'uid'.
      return { id: doc.id, ...data } as Student;
    });
    users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(users);
  }, (error) => {
    console.error("Error listening to historical user updates for messId " + messId, error);
    callback([]);
  });

  return unsubscribe;
}


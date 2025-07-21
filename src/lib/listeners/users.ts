'use client';

import { collection, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';

const USERS_COLLECTION = 'users';

/**
 * Sets up a real-time listener for all students relevant to a specific admin,
 * including active, suspended, and pending students for their mess.
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

  // This query fetches ALL users who are either pending for this mess or already part of it.
  const q = query(
    collection(db, USERS_COLLECTION),
    where("role", "==", "student")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users = snapshot.docs
      .map(doc => ({ uid: doc.id, ...doc.data() } as Student))
      .filter(user => user.messId === messId); // Filter on the client side

    users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(users);

  }, (error) => {
    console.error("Error listening to user updates for messId " + messId, error);
    callback([]);
  });

  return unsubscribe;
}

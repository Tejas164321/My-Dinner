
'use client';

import { collection, onSnapshot, query, where, Unsubscribe, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';

const USERS_COLLECTION = 'users';
const SUSPENDED_STUDENTS_COLLECTION = 'suspended_students';

/**
 * Sets up a real-time listener for all students relevant to a specific admin,
 * including active, suspended, and pending students for their mess.
 * @param messId The UID of the admin/mess to fetch users for.
 * @param callback The function to call with the updated users list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onUsersUpdate(messId: string, callback: (users: Student[], historicalUsers: Student[]) => void): Unsubscribe {
  if (!messId) {
    console.warn("onUsersUpdate called without a messId.");
    callback([], []);
    return () => {}; // Return an empty unsubscribe function
  }

  // Query for all standard users belonging to the mess
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where("role", "==", "student"),
    where("messId", "==", messId)
  );

  // Query for all historical users belonging to the mess
  const historicalUsersQuery = query(
      collection(db, SUSPENDED_STUDENTS_COLLECTION),
      where("messId", "==", messId)
  );

  const unsubUsers = onSnapshot(usersQuery, () => {
      // Re-fetch both collections whenever either one changes.
      fetchAllAndCallback();
  }, (error) => {
      console.error("Error on users snapshot: ", error);
      fetchAllAndCallback(); // Still try to fetch on error
  });
  
  const unsubHistorical = onSnapshot(historicalUsersQuery, () => {
      fetchAllAndCallback();
  }, (error) => {
      console.error("Error on historical users snapshot: ", error);
      fetchAllAndCallback(); // Still try to fetch on error
  });

  const fetchAllAndCallback = async () => {
    try {
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Student));
        users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        const historicalSnapshot = await getDocs(historicalUsersQuery);
        const historicalUsers = historicalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        historicalUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        callback(users, historicalUsers);
    } catch (error) {
        console.error("Error fetching all users and historical data:", error);
        callback([], []); // Provide empty arrays on failure
    }
  }

  // Initial fetch
  fetchAllAndCallback();

  return () => {
    unsubUsers();
    unsubHistorical();
  };
}

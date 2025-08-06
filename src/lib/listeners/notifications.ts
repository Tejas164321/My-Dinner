
'use client';

import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PersonalNotification } from '@/lib/data';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Sets up a real-time listener for personal notification updates for a specific student.
 * This is a client-side function.
 * @param studentId The UID of the student to fetch notifications for.
 * @param callback The function to call with the updated notifications list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onNotificationsUpdate(studentId: string, callback: (notifications: PersonalNotification[]) => void) {
  if (!studentId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("studentId", "==", studentId),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as PersonalNotification;
    });
    callback(notifications);
  }, (error) => {
    console.error("Error listening to personal notification updates:", error);
    callback([]);
  });

  return unsubscribe;
}

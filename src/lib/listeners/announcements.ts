'use client';

import { collection, onSnapshot, query, Timestamp, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Announcement } from '@/lib/data';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

/**
 * Sets up a real-time listener for announcement updates for a specific mess.
 * This is a client-side function.
 * @param messId The ID of the mess to fetch announcements for.
 * @param callback The function to call with the updated announcements list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onAnnouncementsUpdate(messId: string, callback: (announcements: Announcement[]) => void) {
  const q = query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    where("messId", "==", messId),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const announcements = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Announcement;
    });
    callback(announcements);
  }, (error) => {
    console.error("Error listening to announcement updates:", error);
    // On error, return an empty list to prevent crashes.
    callback([]);
  });

  return unsubscribe;
}

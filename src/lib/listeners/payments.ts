

'use client';

import { collection, onSnapshot, query, where, orderBy, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Payment } from '@/lib/data';

const PAYMENTS_COLLECTION = 'payments';

/**
 * Sets up a real-time listener for a specific student's payment updates.
 * @param studentId The UID of the student to fetch payments for.
 * @param callback The function to call with the updated payments list.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onPaymentsUpdate(studentId: string, callback: (payments: Payment[]) => void): Unsubscribe {
  if (!studentId) {
    console.warn("onPaymentsUpdate called without a studentId.");
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("studentId", "==", studentId),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const payments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Payment;
    });
    callback(payments);
  }, (error) => {
    console.error(`Error listening to payments for student ${studentId}:`, error);
    callback([]);
  });

  return unsubscribe;
}

/**
 * Sets up a real-time listener for pending payments for a specific mess. (Admin)
 * @param messId The UID of the admin/mess.
 * @param callback The function to call with the updated list of pending payments.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onPendingPaymentsUpdate(messId: string, callback: (payments: Payment[]) => void): Unsubscribe {
  if (!messId) {
    console.warn("onPendingPaymentsUpdate called without a messId.");
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("messId", "==", messId),
    where("status", "==", "pending"),
    orderBy("date", "asc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Payment));
    callback(payments);
  }, (error) => {
    console.error(`Error listening to pending payments for mess ${messId}:`, error);
    callback([]);
  });

  return unsubscribe;
}

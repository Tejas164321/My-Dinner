'use client';

import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlanChangeRequest, JoinRequest } from '@/lib/data';

const USERS_COLLECTION = 'users';
const PLAN_CHANGE_REQUESTS_COLLECTION = 'planChangeRequests';

export function onJoinRequestsUpdate(callback: (requests: JoinRequest[]) => void) {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("role", "==", "student"),
    where("status", "==", "pending_approval")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        studentId: data.studentId,
        contact: data.contact,
        roomNo: data.roomNo,
        date: data.joinDate,
      } as JoinRequest;
    });
    callback(requests);
  }, (error) => {
    console.error("Error listening to join requests:", error);
    callback([]);
  });

  return unsubscribe;
}

export function onPlanChangeRequestsUpdate(callback: (requests: PlanChangeRequest[]) => void) {
  const q = query(collection(db, PLAN_CHANGE_REQUESTS_COLLECTION), orderBy("date", "desc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PlanChangeRequest));
    callback(requests);
  }, (error) => {
    console.error("Error listening to plan change requests:", error);
    callback([]);
  });

  return unsubscribe;
}

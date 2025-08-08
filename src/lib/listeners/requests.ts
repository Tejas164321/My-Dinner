
'use client';

import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlanChangeRequest, JoinRequest } from '@/lib/data';

const USERS_COLLECTION = 'users';
const PLAN_CHANGE_REQUESTS_COLLECTION = 'planChangeRequests';

export function onJoinRequestsUpdate(messId: string, callback: (requests: JoinRequest[]) => void) {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("role", "==", "student"),
    where("status", "==", "pending_approval"),
    where("messId", "==", messId)
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

export function onPlanChangeRequestsUpdate(messId: string, callback: (requests: PlanChangeRequest[]) => void) {
  const q = query(collection(db, PLAN_CHANGE_REQUESTS_COLLECTION), where("messId", "==", messId));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PlanChangeRequest));
    // Sort on client since we can't order by a field different from the where filter without a composite index
    requests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(requests);
  }, (error) => {
    console.error("Error listening to plan change requests:", error);
    callback([]);
  });

  return unsubscribe;
}

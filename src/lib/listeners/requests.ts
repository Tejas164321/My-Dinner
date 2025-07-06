'use client';

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlanChangeRequest } from '@/lib/data';

const PLAN_CHANGE_REQUESTS_COLLECTION = 'planChangeRequests';

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

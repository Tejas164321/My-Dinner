'use client';

import { collection, onSnapshot, query, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';

const USERS_COLLECTION = 'users';

const docToStudent = (doc: DocumentData): Student => {
    const data = doc.data();
    // A default student object to prevent crashes if data is malformed
    const defaultStudent: Student = {
        id: doc.id,
        name: 'Unknown Student',
        studentId: 'N/A',
        joinDate: new Date().toISOString().split('T')[0],
        email: 'unknown@example.com',
        contact: 'N/A',
        roomNo: 'N/A',
        status: 'suspended',
        messPlan: 'full_day',
    };

    return { ...defaultStudent, ...data };
};


export function onUsersUpdate(callback: (users: Student[]) => void) {
  const q = query(collection(db, USERS_COLLECTION), orderBy("name", "asc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const users = querySnapshot.docs.map(docToStudent);
    callback(users);
  }, (error) => {
    console.error("Error listening to user updates:", error);
    callback([]);
  });

  return unsubscribe;
}

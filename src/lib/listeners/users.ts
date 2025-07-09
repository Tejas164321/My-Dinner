'use client';

import { collection, onSnapshot, query, DocumentData, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';

const USERS_COLLECTION = 'users';

const docToStudent = (doc: DocumentData): Student => {
    const data = doc.data();
    // A default student object to prevent crashes if data is malformed
    const defaultStudent: Omit<Student, 'id'> = {
        name: 'Unknown Student',
        studentId: 'N/A',
        joinDate: new Date().toISOString().split('T')[0],
        email: 'unknown@example.com',
        contact: 'N/A',
        roomNo: 'N/A',
        status: 'suspended',
        messPlan: 'full_day',
        role: 'student',
        uid: doc.id,
    };

    return { id: doc.id, ...defaultStudent, ...data };
};


export function onUsersUpdate(messId: string, callback: (users: Student[]) => void) {
  const q = query(
      collection(db, USERS_COLLECTION),
      where("messId", "==", messId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: doc.id,
        ...data,
      } as Student;
    });
    // Sort on the client since we can't order by a field different from the where filter without a composite index
    users.sort((a, b) => a.name.localeCompare(b.name));
    callback(users);
  }, (error) => {
    console.error("Error listening to user updates:", error);
    callback([]);
  });

  return unsubscribe;
}

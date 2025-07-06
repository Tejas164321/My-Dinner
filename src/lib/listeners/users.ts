'use client';

import { collection, onSnapshot, query, orderBy, DocumentData, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, AppUser } from '@/lib/data';

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


export function onUsersUpdate(callback: (users: Student[]) => void) {
  const q = query(
      collection(db, USERS_COLLECTION),
      where("role", "==", "student"), 
      orderBy("name", "asc")
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
    callback(users);
  }, (error) => {
    console.error("Error listening to user updates:", error);
    callback([]);
  });

  return unsubscribe;
}

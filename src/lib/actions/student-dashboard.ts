
'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DailyMenu {
  lunch: string[];
  dinner: string[];
  messId: string;
}

const menuCollection = 'menus';
const createMenuDocId = (messId: string, dateKey: string) => `${messId}_${dateKey}`;

export async function getMenuForDateAction(messId: string, dateKey: string): Promise<Omit<DailyMenu, 'messId'> | null> {
  if (!messId) return null;
  try {
    const docId = createMenuDocId(messId, dateKey);
    const docRef = doc(db, menuCollection, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { lunch, dinner } = docSnap.data() as DailyMenu;
      return { lunch, dinner };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in server action getMenuForDate:", error);
    return null;
  }
}

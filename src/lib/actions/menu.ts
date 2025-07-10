import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DailyMenu {
  lunch: string[];
  dinner: string[];
}

// The document ID in the 'menus' collection will be the date string 'YYYY-MM-DD'
const menuCollection = 'menus';

/**
 * Fetches the menu for a specific date from Firestore.
 * @param dateKey The date in 'YYYY-MM-DD' format.
 * @returns The daily menu object or null if it doesn't exist.
 */
export async function getMenuForDate(dateKey: string): Promise<DailyMenu | null> {
  try {
    const docRef = doc(db, menuCollection, dateKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DailyMenu;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting menu document:", error);
    return null;
  }
}

/**
 * Saves or updates the menu for a specific date in Firestore.
 * This is a client-side function that relies on the user's auth state.
 * @param dateKey The date in 'YYYY-MM-DD' format.
 * @param menu The daily menu object to save.
 */
export async function saveMenuForDate(dateKey: string, menu: DailyMenu): Promise<void> {
  try {
    const docRef = doc(db, menuCollection, dateKey);
    await setDoc(docRef, menu, { merge: true }); // Using merge to be non-destructive
  } catch (error) {
    console.error("Error saving menu document:", error);
    // Optionally re-throw or handle the error as needed
    throw new Error('Failed to save menu.');
  }
}

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DailyMenu {
  lunch: string[];
  dinner: string[];
  messId: string;
}

// The document ID in the 'menus' collection will be messId_YYYY-MM-DD
const menuCollection = 'menus';

/**
 * Creates a unique document ID for a menu.
 * @param messId The ID of the mess.
 * @param dateKey The date in 'YYYY-MM-DD' format.
 */
const createMenuDocId = (messId: string, dateKey: string) => `${messId}_${dateKey}`;

/**
 * Fetches the menu for a specific date from Firestore.
 * @param messId The ID of the mess.
 * @param dateKey The date in 'YYYY-MM-DD' format.
 * @returns The daily menu object or null if it doesn't exist.
 */
export async function getMenuForDate(messId: string, dateKey: string): Promise<DailyMenu | null> {
  if (!messId) return null;
  try {
    const docId = createMenuDocId(messId, dateKey);
    const docRef = doc(db, menuCollection, docId);
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
 * @param messId The ID of the mess.
 * @param dateKey The date in 'YYYY-MM-DD' format.
 * @param menu The daily menu object to save (without messId).
 */
export async function saveMenuForDate(messId: string, dateKey: string, menu: Omit<DailyMenu, 'messId'>): Promise<void> {
  if (!messId) throw new Error('Mess ID is required to save a menu.');
  try {
    const docId = createMenuDocId(messId, dateKey);
    const docRef = doc(db, menuCollection, docId);
    const menuToSave: DailyMenu = { ...menu, messId };
    await setDoc(docRef, menuToSave, { merge: true }); // Using merge to be non-destructive
  } catch (error) {
    console.error("Error saving menu document:", error);
    // Optionally re-throw or handle the error as needed
    throw new Error('Failed to save menu.');
  }
}

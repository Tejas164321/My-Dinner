
import { collection, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Holiday } from '@/lib/data';
import { format } from 'date-fns';

const HOLIDAYS_COLLECTION = 'holidays';

type HolidayPayload = Omit<Holiday, 'date'> & { date: string };

/**
 * Adds an array of holiday objects to Firestore.
 * This is a client-side function that relies on the user's auth state.
 */
export async function addHolidays(holidays: HolidayPayload[]): Promise<void> {
    const holidayDates = new Set<string>();

    for (const holiday of holidays) {
        const dateKey = format(new Date(holiday.date), 'yyyy-MM-dd');

        // Prevent adding multiple holidays for the same day in a single request
        if (holidayDates.has(dateKey)) {
            continue;
        }

        const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // This date is already a holiday, so we throw an error.
            // A more advanced implementation might allow overwriting.
            throw new Error(`A holiday for ${dateKey} already exists.`);
        }
        holidayDates.add(dateKey);
    }
    
    // If all checks pass, proceed with batch writing
    try {
        const batch = holidays.map(holiday => {
            const dateObj = new Date(holiday.date);
            const dateKey = format(dateObj, 'yyyy-MM-dd');
            const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
            
            const dataToSave: Holiday = {
                ...holiday,
                date: dateObj,
            };

            return setDoc(docRef, dataToSave);
        });
        await Promise.all(batch);
    } catch (error) {
        console.error("Error adding holidays to Firestore:", error);
        throw new Error('Failed to save holidays to the database.');
    }
}


/**
 * Deletes a holiday from Firestore based on its date.
 * Accepts a date string for compatibility.
 */
export async function deleteHoliday(dateString: string): Promise<void> {
  try {
    const dateKey = format(new Date(dateString), 'yyyy-MM-dd');
    const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting holiday:", error);
    throw new Error('Failed to delete holiday.');
  }
}

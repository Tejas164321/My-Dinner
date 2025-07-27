'use server';

import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Leave } from '@/lib/data';
import { eachDayOfInterval, startOfDay, isSameDay } from 'date-fns';

const LEAVES_COLLECTION = 'leaves';

interface ActivationPayload {
    studentUid: string;
    startDate: Date;
    startMeal: 'lunch' | 'dinner';
}

export async function activateStudentPlan(payload: ActivationPayload): Promise<void> {
    const { studentUid, startDate, startMeal } = payload;
    const today = startOfDay(new Date());

    const batch = writeBatch(db);

    // 1. Create leaves for the days before the start date
    const interval = eachDayOfInterval({
        start: today,
        end: startDate,
    });
    
    for (const day of interval) {
        const leaveDocRef = doc(collection(db, LEAVES_COLLECTION));
        let leaveData: Omit<Leave, 'id' | 'date'> & { date: Date };
        
        if (isSameDay(day, startDate)) {
             // On the start date, only add a lunch leave if they start from dinner
            if (startMeal === 'dinner') {
                leaveData = { studentId: studentUid, name: 'Plan Activation', type: 'lunch_only', date: day };
                batch.set(leaveDocRef, leaveData);
            }
        } else {
             // For all days before the start date, create a full-day leave
             leaveData = { studentId: studentUid, name: 'Plan Activation', type: 'full_day', date: day };
             batch.set(leaveDocRef, leaveData);
        }
    }

    // 2. Update the student's document
    const studentRef = doc(db, 'users', studentUid);
    batch.update(studentRef, {
        status: 'active',
        planStartDate: startDate,
        planStartMeal: startMeal,
    });
    
    try {
        await batch.commit();
    } catch (error) {
        console.error("Error in activateStudentPlan batch commit:", error);
        throw new Error('Failed to update student plan and create leaves.');
    }
}

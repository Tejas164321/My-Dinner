
'use server';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CashPaymentPayload {
    studentId: string;
    studentName: string;
    messId: string;
    amount: number;
    billMonth: string;
    billYear: number;
}

export async function recordCashPayment(payload: CashPaymentPayload) {
    if (!payload.studentId || !payload.messId || !payload.amount) {
        throw new Error("Missing required payment information.");
    }
    
    try {
        await addDoc(collection(db, 'payments'), {
            ...payload,
            paymentMethod: 'cash',
            status: 'pending',
            date: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error recording cash payment in Firestore:", error);
        throw new Error('Failed to record cash payment.');
    }
}

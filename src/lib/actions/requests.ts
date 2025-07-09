
'use server';

import { collection, doc, writeBatch, deleteDoc, updateDoc, getDoc, serverTimestamp, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';
import { revalidatePath } from 'next/cache';

// This file is being phased out.
// Most of these functions have been moved to client components to handle authentication correctly.
// This file is kept for reference and potential future use of non-authenticated server actions.

// Note: The functions approveStudent, rejectStudent, suspendStudent, reactivateStudent, deleteStudent, 
// approvePlanChangeRequest, and rejectPlanChangeRequest have been moved to src/components/admin/students-table.tsx
// to be executed as client-side actions.

// Note: The function cancelJoinRequest has been moved to src/app/student/select-mess/page.tsx
// to be executed as a client-side action.

// Note: The function submitPlanChangeRequest has been moved to src/app/student/settings/page.tsx
// to be executed as a client-side action.

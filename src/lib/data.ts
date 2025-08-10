

import { format, subDays, addDays, startOfDay } from 'date-fns';

export const studentNavItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/student/leave', label: 'Apply for Leave', icon: 'CalendarDays' },
    { href: '/student/attendance', label: 'My Attendance', icon: 'UserCheck' },
    { href: '/student/bills', label: 'My Bills', icon: 'CircleDollarSign' },
    { href: '/student/notifications', label: 'Notifications', icon: 'Bell' },
    { href: '/student/settings', label: 'Settings', icon: 'Settings' },
];

export const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/students', label: 'Students', icon: 'Users' },
    { href: '/admin/menu', label: 'Meal Menu', icon: 'Utensils' },
    { href: '/admin/billing', label: 'Billing', icon: 'CircleDollarSign' },
    { href: '/admin/holidays', label: 'Holidays', icon: 'CalendarDays' },
    { href: '/admin/announcements', label: 'Announcements', icon: 'Megaphone' },
    { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
];

export interface BillDetails {
    totalMeals: number;
    chargePerMeal: number;
    totalDaysInMonth: number;
    holidays: number;
    billableDays: number;
    fullDays: number;
    halfDays: number;
    absentDays: number;
}

export interface JoinRequest {
    id: string; // This is the user's UID
    name: string;
    studentId: string;
    contact: string;
    roomNo: string;
    date: string;
    messPlan?: 'full_day' | 'lunch_only' | 'dinner_only';
}

export interface PlanChangeRequest {
    id: string; // Firestore document ID
    studentUid: string;
    studentId: string;
    studentName: string;
    fromPlan: 'full_day' | 'lunch_only' | 'dinner_only';
    toPlan: 'full_day' | 'lunch_only' | 'dinner_only';
    date: string;
    messId: string;
}

export interface AppUser {
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'student';
    messName?: string;
    secretCode?: string;
    studentId?: string;
    contact?: string;
    roomNo?: string;
    joinDate?: string;
    status?: 'active' | 'suspended' | 'pending_approval' | 'unaffiliated' | 'rejected' | 'pending_start' | 'left';
    messId?: string;
    messPlan?: 'full_day' | 'lunch_only' | 'dinner_only';
    avatarUrl?: string;
    planStartDate?: any;
    planStartMeal?: 'lunch' | 'dinner';
    originalJoinDate?: string;
    leaveDate?: string;
}

export interface Student extends AppUser {
    id: string; // Firestore document ID for suspended_students
    role: 'student';
    studentId: string;
    contact: string;
    roomNo: string;
    joinDate: string;
    status: 'active' | 'suspended' | 'pending_approval' | 'unaffiliated' | 'rejected' | 'pending_start' | 'left';
    messPlan: 'full_day' | 'lunch_only' | 'dinner_only';
    messId: string;
    messName: string;
}

export const commonMenuItems = ['Dal', 'Rice', 'Chapatti', 'Salad', 'Raita', 'Pulav'];

export interface Holiday {
    date: Date;
    name: string;
    type: 'full_day' | 'lunch_only' | 'dinner_only';
    messId: string;
}

export interface Leave {
    id: string; // Document ID from Firestore
    studentId: string;
    date: Date;
    name: string;
    type: 'full_day' | 'lunch_only' | 'dinner_only';
}

export interface Payment {
    id: string;
    studentId: string;
    studentName: string;
    messId: string;
    amount: number;
    billMonth: string;
    billYear: number;
    date: string;
    status: 'pending' | 'confirmed' | 'rejected';
    paymentMethod: 'cash' | 'online';
    confirmedBy?: string;
    confirmationDate?: string;
}

export interface Bill {
    id: string;
    month: string;
    year: number;
    generationDate: string;
    totalAmount: number;
    payments: Payment[];
    details: BillDetails;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    date: string; // ISO string
    messId: string;
}

export interface PersonalNotification {
    id: string;
    studentId: string;
    messId: string;
    title: string;
    message: string;
    date: string; // ISO string
    type: 'billing' | 'request_status' | 'general';
    isRead: boolean;
    href?: string;
}

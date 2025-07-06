
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
    { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/students', label: 'Students', icon: 'Users' },
    { href: '/admin/menu', label: 'Meal Menu', icon: 'Utensils' },
    { href: '/admin/billing', label: 'Billing', icon: 'CircleDollarSign' },
    { href: '/admin/holidays', label: 'Holidays', icon: 'CalendarDays' },
    { href: '/admin/announcements', label: 'Announcements', icon: 'Bell' },
    { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
];

export const messInfo = {
  name: 'Messo Central Kitchen',
  address: '123 College Road, University Campus, New Delhi - 110001',
  email: 'contact@messo.com',
  phone: '+91 12345 67890',
};

export const attendanceData = [
  { name: 'Jan', total: 850, attended: 780 },
  { name: 'Feb', total: 920, attended: 850 },
  { name: 'Mar', total: 950, attended: 900 },
  { name: 'Apr', total: 880, attended: 810 },
  { name: 'May', total: 930, attended: 890 },
  { name: 'Jun', total: 960, attended: 940 },
  { name: 'Jul', total: 980, attended: 960 },
];

export const revenueData = [
    { month: 'Jan', revenue: 250000 },
    { month: 'Feb', revenue: 265000 },
    { month: 'Mar', revenue: 275000 },
    { month: 'Apr', revenue: 270000 },
    { month: 'May', revenue: 280000 },
    { month: 'Jun', revenue: 290000 },
    { month: 'Jul', revenue: 285450 },
];


export const joinRequests = [
    { id: '1', name: 'John Doe', studentId: 'B12345', date: '2023-10-27' },
    { id: '2', name: 'Jane Smith', studentId: 'B67890', date: '2023-10-26' },
    { id: '3', name: 'Sam Wilson', studentId: 'B54321', date: '2023-10-26' },
];

export interface PlanChangeRequest {
    id: string;
    studentName: string;
    studentId: string;
    fromPlan: 'full_day' | 'lunch_only' | 'dinner_only';
    toPlan: 'full_day' | 'lunch_only' | 'dinner_only';
    date: string;
}

export const planChangeRequests: PlanChangeRequest[] = [
    { id: 'pcr1', studentName: 'Mary Jane', studentId: 'B44556', fromPlan: 'lunch_only', toPlan: 'full_day', date: '2023-10-28' },
    { id: 'pcr2', studentName: 'Sara Bell', studentId: 'C12378', fromPlan: 'dinner_only', toPlan: 'full_day', date: '2023-10-27' },
];

export const monthMap: { [key: string]: Date } = {
  'july': new Date(2023, 6, 1),
  'august': new Date(2023, 7, 1),
  'september': new Date(2023, 8, 1),
  'october': new Date(2023, 9, 1),
};

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

export interface Student {
    id: string;
    name: string;
    studentId: string;
    joinDate: string;
    email: string;
    contact: string;
    roomNo: string;
    status: 'active' | 'suspended';
    messPlan: 'full_day' | 'lunch_only' | 'dinner_only';
}

export const studentsData: Student[] = [
    { 
        id: '4', name: 'Peter Jones', studentId: 'B11223', joinDate: '2023-09-15', email: 'peter.jones@example.com', contact: '+91 9876543210', roomNo: 'H-101',
        status: 'active',
        messPlan: 'full_day',
    },
    { 
        id: '5', name: 'Mary Jane', studentId: 'B44556', joinDate: '2023-09-14', email: 'mary.jane@example.com', contact: '+91 9876543211', roomNo: 'H-102',
        status: 'active',
        messPlan: 'lunch_only',
    },
    { 
        id: '6', name: 'Chris Lee', studentId: 'B77889', joinDate: '2023-09-13', email: 'chris.lee@example.com', contact: '+91 9876543212', roomNo: 'H-201',
        status: 'active',
        messPlan: 'full_day',
    },
    { 
        id: '7', name: 'Bryan Fury', studentId: 'B98765', joinDate: '2023-09-12', email: 'bryan.fury@example.com', contact: '+91 9876543213', roomNo: 'H-202',
        status: 'suspended',
        messPlan: 'full_day',
    },
    { 
        id: '8', name: 'Alex Doe', studentId: 'A56789', joinDate: '2023-09-11', email: 'alex.doe@example.com', contact: '+91 9876543214', roomNo: 'H-301',
        status: 'active',
        messPlan: 'full_day',
    },
    { 
        id: '9', name: 'Sara Bell', studentId: 'C12378', joinDate: '2023-09-10', email: 'sara.bell@example.com', contact: '+91 9876543215', roomNo: 'H-302',
        status: 'active',
        messPlan: 'dinner_only',
    },
];

export const commonMenuItems = ['Dal', 'Rice', 'Chapatti', 'Salad', 'Raita', 'Pulav'];

export interface Holiday {
    date: Date;
    name: string;
    type: 'full_day' | 'lunch_only' | 'dinner_only';
}

export interface Leave {
    id: string; // Document ID from Firestore
    studentId: string;
    date: Date;
    name: string;
    type: 'full_day' | 'lunch_only' | 'dinner_only';
}

export interface Bill {
    id: string;
    month: string;
    year: number;
    generationDate: string;
    totalAmount: number;
    payments: { amount: number; date: string }[];
    status: 'Paid' | 'Due';
    details: BillDetails;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    date: string;
}

export const pastAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Diwali Celebration Dinner',
        message: 'A special dinner will be served on the occasion of Diwali. Please join us for the celebration!',
        date: '2023-11-10',
    },
    {
        id: '2',
        title: 'Mess Closure for Maintenance',
        message: 'The mess will be closed for regular maintenance on Sunday from 9 AM to 5 PM. Please make alternate arrangements.',
        date: '2023-11-05',
    },
    {
        id: '3',
        title: 'Feedback Form for October',
        message: 'Your feedback is valuable to us. Please fill out the feedback form for the month of October. Link is available on the student dashboard.',
        date: '2023-10-30',
    }
];

export interface PaymentReminder {
    id: string;
    title: string;
    message: string;
    date: string;
}

export const paymentReminders: PaymentReminder[] = [
    {
        id: 'rem1',
        title: 'Payment Due for August',
        message: 'Your bill for August of ₹3,120 is overdue. Please pay at the earliest to avoid late fees.',
        date: '2023-09-25',
    },
];

export interface AppUser {
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'student';
    studentId?: string;
    contact?: string;
    joinDate?: string;
    messPlan?: 'full_day' | 'lunch_only' | 'dinner_only';
    avatarUrl?: string;
}


import { format, subDays, addDays, startOfDay } from 'date-fns';

export const studentNavItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/student/leave', label: 'Leave', icon: 'CalendarDays' },
    { href: '/student/attendance', label: 'Attendance', icon: 'UserCheck' },
    { href: '/student/bills', label: 'Bills', icon: 'CircleDollarSign' },
    { href: '/student/notifications', label: 'Notifications', icon: 'Bell' },
    { href: '/student/settings', label: 'Settings', icon: 'Settings' },
];

export const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/students', label: 'Students', icon: 'Users' },
    { href: '/admin/menu', label: 'Menu', icon: 'Utensils' },
    { href: '/admin/billing', label: 'Billing', icon: 'CircleDollarSign' },
    { href: '/admin/holidays', label: 'Holidays', icon: 'CalendarDays' },
    { href: '/admin/announcements', label: 'Announcements', icon: 'Megaphone' },
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
    status?: 'active' | 'suspended' | 'pending_approval' | 'unaffiliated';
    messId?: string;
    messPlan?: 'full_day' | 'lunch_only' | 'dinner_only';
    avatarUrl?: string;
}

export interface Student extends AppUser {
    role: 'student';
    studentId: string;
    contact: string;
    roomNo: string;
    joinDate: string;
    status: 'active' | 'suspended' | 'pending_approval' | 'unaffiliated';
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
    messId: string;
}

export const pastAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Diwali Celebration Dinner',
        message: 'A special dinner will be served on the occasion of Diwali. Please join us for the celebration!',
        date: '2023-11-10',
        messId: 'dummy'
    },
    {
        id: '2',
        title: 'Mess Closure for Maintenance',
        message: 'The mess will be closed for regular maintenance on Sunday from 9 AM to 5 PM. Please make alternate arrangements.',
        date: '2023-11-05',
        messId: 'dummy'
    },
    {
        id: '3',
        title: 'Feedback Form for October',
        message: 'Your feedback is valuable to us. Please fill out the feedback form for the month of October. Link is available on the student dashboard.',
        date: '2023-10-30',
        messId: 'dummy'
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

export const studentsData: Student[] = [];

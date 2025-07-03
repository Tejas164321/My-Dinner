

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

export const adminUser = {
  name: 'Admin Staff',
  role: 'Mess Manager',
  email: 'admin@messo.com',
  avatarUrl: '',
};

export const studentUser = {
    id: '8',
    name: 'Alex Doe',
    role: 'Student',
    email: 'alex.doe@example.com',
    avatarUrl: '',
    studentId: 'A56789',
    joinDate: '2023-09-11',
    contact: '+91 98765 43214',
    messPlan: 'full_day' as 'full_day' | 'lunch_only' | 'dinner_only',
};

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
    monthlyDetails: {
        [key: string]: {
            attendance: string;
            bill: { 
                total: number; 
                payments: { amount: number; date: string }[],
                details?: {
                    totalMeals: number;
                    chargePerMeal: number;
                }
            };
            status: 'Paid' | 'Due';
        }
    }
}

const CHARGE_PER_MEAL = 65;

export const studentsData: Student[] = [
    { 
        id: '4', name: 'Peter Jones', studentId: 'B11223', joinDate: '2023-09-15', email: 'peter.jones@example.com', contact: '+91 9876543210', roomNo: 'H-101',
        status: 'active',
        messPlan: 'full_day',
        monthlyDetails: {
            'october': { attendance: '92%', bill: { total: 3380, payments: [{ amount: 3380, date: '2023-10-05' }], details: { totalMeals: 52, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'september': { attendance: '95%', bill: { total: 3575, payments: [{ amount: 3575, date: '2023-09-05' }], details: { totalMeals: 55, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'august': { attendance: '91%', bill: { total: 3315, payments: [{ amount: 3315, date: '2023-08-05' }], details: { totalMeals: 51, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'july': { attendance: '90%', bill: { total: 3510, payments: [{ amount: 3510, date: '2023-07-05' }], details: { totalMeals: 54, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
        }
    },
    { 
        id: '5', name: 'Mary Jane', studentId: 'B44556', joinDate: '2023-09-14', email: 'mary.jane@example.com', contact: '+91 9876543211', roomNo: 'H-102',
        status: 'active',
        messPlan: 'lunch_only',
        monthlyDetails: {
            'october': { attendance: '88%', bill: { total: 1625, payments: [], details: { totalMeals: 25, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Due' },
            'september': { attendance: '90%', bill: { total: 1755, payments: [{ amount: 1755, date: '2023-09-08' }], details: { totalMeals: 27, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'august': { attendance: '85%', bill: { total: 1690, payments: [{ amount: 1000, date: '2023-08-10' }], details: { totalMeals: 26, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Due' },
            'july': { attendance: '89%', bill: { total: 1885, payments: [{ amount: 1885, date: '2023-07-06' }], details: { totalMeals: 29, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
        }
    },
    { 
        id: '6', name: 'Chris Lee', studentId: 'B77889', joinDate: '2023-09-13', email: 'chris.lee@example.com', contact: '+91 9876543212', roomNo: 'H-201',
        status: 'active',
        messPlan: 'full_day',
        monthlyDetails: {
            'october': { attendance: '98%', bill: { total: 3510, payments: [{ amount: 3510, date: '2023-10-03' }], details: { totalMeals: 54, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'september': { attendance: '96%', bill: { total: 3640, payments: [{ amount: 3640, date: '2023-09-04' }], details: { totalMeals: 56, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'august': { attendance: '99%', bill: { total: 3510, payments: [{ amount: 3510, date: '2023-08-02' }], details: { totalMeals: 54, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'july': { attendance: '97%', bill: { total: 3770, payments: [{ amount: 3770, date: '2023-07-02' }], details: { totalMeals: 58, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
        }
    },
    { 
        id: '7', name: 'Bryan Fury', studentId: 'B98765', joinDate: '2023-09-12', email: 'bryan.fury@example.com', contact: '+91 9876543213', roomNo: 'H-202',
        status: 'suspended',
        messPlan: 'full_day',
        monthlyDetails: {
            'october': { attendance: '75%', bill: { total: 2795, payments: [], details: { totalMeals: 43, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Due' },
            'september': { attendance: '80%', bill: { total: 2990, payments: [], details: { totalMeals: 46, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Due' },
            'august': { attendance: '78%', bill: { total: 2860, payments: [{ amount: 2860, date: '2023-08-20' }], details: { totalMeals: 44, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'july': { attendance: '82%', bill: { total: 3185, payments: [{ amount: 3185, date: '2023-07-21' }], details: { totalMeals: 49, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
        }
    },
    { 
        id: '8', name: 'Alex Doe', studentId: 'A56789', joinDate: '2023-09-11', email: 'alex.doe@example.com', contact: '+91 9876543214', roomNo: 'H-301',
        status: 'active',
        messPlan: 'full_day',
        monthlyDetails: {
            'october': { attendance: '92%', bill: { total: 3380, payments: [{ amount: 3380, date: '2023-10-06' }], details: { totalMeals: 52, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'september': { attendance: '94%', bill: { total: 3510, payments: [{ amount: 3510, date: '2023-09-06' }], details: { totalMeals: 54, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'august': { attendance: '93%', bill: { total: 3380, payments: [{ amount: 3380, date: '2023-08-07' }], details: { totalMeals: 52, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'july': { attendance: '95%', bill: { total: 3705, payments: [{ amount: 3705, date: '2023-07-07' }], details: { totalMeals: 57, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
        }
    },
    { 
        id: '9', name: 'Sara Bell', studentId: 'C12378', joinDate: '2023-09-10', email: 'sara.bell@example.com', contact: '+91 9876543215', roomNo: 'H-302',
        status: 'active',
        messPlan: 'dinner_only',
        monthlyDetails: {
            'october': { attendance: '99%', bill: { total: 1820, payments: [], details: { totalMeals: 28, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Due' },
            'september': { attendance: '100%', bill: { total: 1950, payments: [{ amount: 1950, date: '2023-09-01' }], details: { totalMeals: 30, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'august': { attendance: '98%', bill: { total: 1885, payments: [{ amount: 1885, date: '2023-08-01' }], details: { totalMeals: 29, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Paid' },
            'july': { attendance: '99%', bill: { total: 1950, payments: [], details: { totalMeals: 30, chargePerMeal: CHARGE_PER_MEAL } }, status: 'Due' },
        }
    },
];

export const commonMenuItems = ['Dal', 'Rice', 'Chapatti', 'Salad', 'Raita', 'Pulav'];

export interface DailyMenu {
  lunch: string[];
  dinner: string[];
}

// Use a fixed date to ensure consistent mock data and prevent hydration errors.
const today = startOfDay(new Date(2023, 9, 27));
const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

const pastMenus: [string, DailyMenu][] = [
    [formatDateKey(subDays(today, 7)), { lunch: ['Dal Makhani', 'Jeera Rice', 'Naan', 'Salad'], dinner: ['Mix Veg', 'Roti', 'Dal Tadka'] }],
    [formatDateKey(subDays(today, 6)), { lunch: ['Idli Sambar', 'Coconut Chutney'], dinner: ['Masala Dosa', 'Tomato Chutney'] }],
    [formatDateKey(subDays(today, 5)), { lunch: ['Special Thali (Paneer, Dal, Roti, Rice)'], dinner: ['Pasta Arrabiata', 'Garlic Bread'] }],
    [formatDateKey(subDays(today, 4)), { lunch: ['Puri Sabji', 'Suji Halwa'], dinner: ['Veg Manchurian', 'Fried Rice'] }],
    [formatDateKey(subDays(today, 3)), { lunch: ['Veg Biryani', 'Boondi Raita'], dinner: ['Kadhi Pakora', 'Steamed Rice'] }],
    [formatDateKey(subDays(today, 2)), { lunch: ['Aloo Gobi', 'Roti', 'Dal Fry'], dinner: ['Paneer Butter Masala', 'Jeera Rice', 'Chapatti'] }],
    [formatDateKey(subDays(today, 1)), { lunch: ['Rajma', 'Steamed Rice', 'Salad'], dinner: ['Chole Bhature', 'Onion Salad'] }],
    [formatDateKey(today), { lunch: ['Rajma Chawal', 'Boondi Raita', 'Green Salad'], dinner: ['Chole Bhature', 'Lassi', 'Pickle'] }],
    [formatDateKey(addDays(today, 1)), { lunch: ['Aloo Gobi', 'Dal Tadka', 'Chapatti'], dinner: ['Paneer Butter Masala', 'Jeera Rice', 'Naan'] }],
    [formatDateKey(addDays(today, 2)), { lunch: ["Dal Fry", "Rice", "Salad"], dinner: ["Paneer Do Pyaza", "Roti"] }],
    [formatDateKey(addDays(today, 3)), { lunch: ["Kadhi Chawal", "Papad"], dinner: ["Mix Veg", "Paratha"] }],
    [formatDateKey(addDays(today, 4)), { lunch: ["Masoor Dal", "Rice", "Bhindi Fry"], dinner: ["Aloo Matar", "Roti"] }],
];

// Key: 'YYYY-MM-DD'
export const dailyMenus: Map<string, DailyMenu> = new Map(pastMenus);

export interface Holiday {
    date: Date;
    name: string;
    type: 'full_day' | 'lunch_only' | 'dinner_only';
}

export interface Leave {
    studentId: string;
    date: Date;
    name: string;
    type: 'full_day' | 'lunch_only' | 'dinner_only';
}

export const holidays: Holiday[] = [
    { date: new Date(2023, 9, 2), name: 'Gandhi Jayanti', type: 'full_day' },
    { date: new Date(2023, 9, 24), name: 'Dussehra', type: 'full_day' },
    { date: new Date(2023, 10, 12), name: 'Diwali', type: 'full_day' },
    { date: new Date(2023, 11, 25), name: 'Christmas', type: 'full_day' },
];

export const leaveHistory: Leave[] = [
    { studentId: '5', date: new Date(2023, 9, 15), name: 'Student Leave', type: 'lunch_only' },
    { studentId: '6', date: new Date(2023, 9, 16), name: 'Student Leave', type: 'full_day' },
    // Add leaves for today (2023-10-27) to demonstrate new features
    { studentId: '8', date: new Date(2023, 9, 27), name: 'Student Leave', type: 'full_day' },
    { studentId: '4', date: new Date(2023, 9, 27), name: 'Student Leave', type: 'lunch_only' },
    // Add upcoming leaves for student '8'
    { studentId: '8', date: new Date(2023, 9, 30), name: 'Student Leave', type: 'lunch_only' },
    { studentId: '8', date: new Date(2023, 10, 5), name: 'Student Leave', type: 'full_day' },
    { studentId: '8', date: new Date(2023, 10, 6), name: 'Student Leave', type: 'dinner_only' },
    { studentId: '8', date: new Date(2023, 10, 10), name: 'Student Leave', type: 'full_day' },
    { studentId: '8', date: new Date(2023, 10, 11), name: 'Student Leave', type: 'lunch_only' },
    { studentId: '8', date: new Date(2023, 10, 15), name: 'Student Leave', type: 'dinner_only' },
];

export interface Bill {
    id: string;
    month: string;
    year: number;
    generationDate: string;
    totalAmount: number;
    payments: { amount: number; date: string }[];
    status: 'Paid' | 'Due';
    details: {
        totalDaysInMonth: number;
        holidays: number;
        billableDays: number;
        fullDays: number;
        halfDays: number;
        absentDays: number;
        totalMeals: number;
        chargePerMeal: number;
    }
}

export const billHistory: Bill[] = [
    {
        id: 'bill1', month: 'October', year: 2023, generationDate: '2023-11-01', totalAmount: 3445, 
        payments: [{ amount: 3445, date: '2023-11-05' }], 
        status: 'Paid',
        details: { 
            totalDaysInMonth: 31, 
            holidays: 2,
            billableDays: 29,
            fullDays: 25, 
            halfDays: 3, 
            absentDays: 1, 
            totalMeals: 53, 
            chargePerMeal: 65 
        }
    },
    {
        id: 'bill2', month: 'September', year: 2023, generationDate: '2023-10-01', totalAmount: 3380, 
        payments: [{ amount: 3380, date: '2023-10-04' }], 
        status: 'Paid',
        details: { 
            totalDaysInMonth: 30, 
            holidays: 1,
            billableDays: 29,
            fullDays: 24, 
            halfDays: 4, 
            absentDays: 1, 
            totalMeals: 52, 
            chargePerMeal: 65 
        }
    },
    {
        id: 'bill3', month: 'August', year: 2023, generationDate: '2023-09-01', totalAmount: 3120, 
        payments: [
            { amount: 1000, date: '2023-09-10' },
            { amount: 1000, date: '2023-09-20' }
        ], 
        status: 'Due',
        details: { 
            totalDaysInMonth: 31, 
            holidays: 1,
            billableDays: 30,
            fullDays: 22, 
            halfDays: 4, 
            absentDays: 4, 
            totalMeals: 48, 
            chargePerMeal: 65 
        }
    },
     {
        id: 'bill4', month: 'July', year: 2023, generationDate: '2023-08-01', totalAmount: 3445, 
        payments: [], 
        status: 'Due',
        details: { 
            totalDaysInMonth: 31, 
            holidays: 0,
            billableDays: 31,
            fullDays: 25, 
            halfDays: 3, 
            absentDays: 3, 
            totalMeals: 53, 
            chargePerMeal: 65 
        }
    },
];


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
    {
        id: 'rem2',
        title: 'Reminder: July Bill Overdue',
        message: 'This is a final reminder that your July bill of ₹3,445 is still pending. Please clear your dues immediately.',
        date: '2023-09-15',
    },
    {
        id: 'rem3',
        title: 'Gentle Reminder: August Bill',
        message: 'A friendly reminder that your August bill payment is pending. The due amount is ₹1,120.',
        date: '2023-09-10',
    },
    {
        id: 'rem4',
        title: 'Urgent: July Bill Payment',
        message: 'Your July bill of ₹3,445 is significantly overdue. Please pay now to restore full services.',
        date: '2023-09-05',
    },
    {
        id: 'rem5',
        title: 'First Reminder for August Bill',
        message: 'This is a reminder that your August bill is now due. The total amount is ₹3,120.',
        date: '2023-09-02',
    },
    {
        id: 'rem6',
        title: 'Final Reminder: June Bill',
        message: 'Your June bill of ₹3,200 is overdue. This is the final reminder before action is taken.',
        date: '2023-8-20',
    },
    {
        id: 'rem7',
        title: 'Payment Pending for June',
        message: 'Your payment for the June bill is still pending. Amount due: ₹3,200.',
        date: '2023-8-10',
    },
    {
        id: 'rem8',
        title: 'May Bill Overdue',
        message: 'Your bill for May of ₹3,300 is overdue. Please pay at the earliest.',
        date: '2023-7-25',
    },
    {
        id: 'rem9',
        title: 'Gentle Reminder: May Bill',
        message: 'A friendly reminder that your May bill payment of ₹3,300 is pending.',
        date: '2023-7-15',
    },
    {
        id: 'rem10',
        title: 'April Bill Payment Reminder',
        message: 'This is a reminder for your April bill payment of ₹3,150.',
        date: '2023-6-10',
    },
];

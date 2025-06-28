import { format, subDays, addDays } from 'date-fns';

export const studentNavItems = [
    { href: '/student', label: 'Dashboard', icon: 'BarChart' },
    { href: '/student/leave', label: 'Apply for Leave', icon: 'CalendarDays' },
    { href: '/student/attendance', label: 'My Attendance', icon: 'UserCheck' },
    { href: '/student/bills', label: 'My Bills', icon: 'CircleDollarSign' },
    { href: '/student/notifications', label: 'Notifications', icon: 'Bell' },
];

export const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: 'BarChart' },
    { href: '/admin/students', label: 'Students', icon: 'Users' },
    { href: '/admin/menu', label: 'Meal Menu', icon: 'Utensils' },
    { href: '/admin/billing', label: 'Billing', icon: 'CircleDollarSign' },
    { href: '/admin/holidays', label: 'Holidays', icon: 'CalendarDays' },
];

export const adminUser = {
  name: 'Admin Staff',
  role: 'Mess Manager',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export const studentUser = {
    name: 'Alex Doe',
    role: 'Student',
    avatarUrl: 'https://placehold.co/100x100.png',
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
    monthlyDetails: {
        [key: string]: {
            attendance: string;
            bill: { total: number; paid: number };
            status: 'Paid' | 'Due';
        }
    }
}

export const studentsData: Student[] = [
    { 
        id: '4', name: 'Peter Jones', studentId: 'B11223', joinDate: '2023-09-15', email: 'peter.jones@example.com', contact: '+91 9876543210', roomNo: 'H-101',
        status: 'active',
        monthlyDetails: {
            'october': { attendance: '92%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'september': { attendance: '95%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'august': { attendance: '91%', bill: { total: 3150, paid: 3150 }, status: 'Paid' },
            'july': { attendance: '90%', bill: { total: 3200, paid: 3200 }, status: 'Paid' },
        }
    },
    { 
        id: '5', name: 'Mary Jane', studentId: 'B44556', joinDate: '2023-09-14', email: 'mary.jane@example.com', contact: '+91 9876543211', roomNo: 'H-102',
        status: 'active',
        monthlyDetails: {
            'october': { attendance: '88%', bill: { total: 3250, paid: 0 }, status: 'Due' },
            'september': { attendance: '90%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'august': { attendance: '85%', bill: { total: 3150, paid: 0 }, status: 'Due' },
            'july': { attendance: '89%', bill: { total: 3200, paid: 3200 }, status: 'Paid' },
        }
    },
    { 
        id: '6', name: 'Chris Lee', studentId: 'B77889', joinDate: '2023-09-13', email: 'chris.lee@example.com', contact: '+91 9876543212', roomNo: 'H-201',
        status: 'active',
        monthlyDetails: {
            'october': { attendance: '98%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'september': { attendance: '96%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'august': { attendance: '99%', bill: { total: 3150, paid: 3150 }, status: 'Paid' },
            'july': { attendance: '97%', bill: { total: 3200, paid: 3200 }, status: 'Paid' },
        }
    },
    { 
        id: '7', name: 'Bryan Fury', studentId: 'B98765', joinDate: '2023-09-12', email: 'bryan.fury@example.com', contact: '+91 9876543213', roomNo: 'H-202',
        status: 'suspended',
        monthlyDetails: {
            'october': { attendance: '75%', bill: { total: 3250, paid: 0 }, status: 'Due' },
            'september': { attendance: '80%', bill: { total: 3250, paid: 0 }, status: 'Due' },
            'august': { attendance: '78%', bill: { total: 3150, paid: 3150 }, status: 'Paid' },
            'july': { attendance: '82%', bill: { total: 3200, paid: 3200 }, status: 'Paid' },
        }
    },
    { 
        id: '8', name: 'Alex Doe', studentId: 'A56789', joinDate: '2023-09-11', email: 'alex.doe@example.com', contact: '+91 9876543214', roomNo: 'H-301',
        status: 'active',
        monthlyDetails: {
            'october': { attendance: '92%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'september': { attendance: '94%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'august': { attendance: '93%', bill: { total: 3150, paid: 3150 }, status: 'Paid' },
            'july': { attendance: '95%', bill: { total: 3200, paid: 3200 }, status: 'Paid' },
        }
    },
    { 
        id: '9', name: 'Sara Bell', studentId: 'C12378', joinDate: '2023-09-10', email: 'sara.bell@example.com', contact: '+91 9876543215', roomNo: 'H-302',
        status: 'active',
        monthlyDetails: {
            'october': { attendance: '99%', bill: { total: 3250, paid: 0 }, status: 'Due' },
            'september': { attendance: '100%', bill: { total: 3250, paid: 3250 }, status: 'Paid' },
            'august': { attendance: '98%', bill: { total: 3150, paid: 3150 }, status: 'Paid' },
            'july': { attendance: '99%', bill: { total: 3200, paid: 0 }, status: 'Due' },
        }
    },
];

export const commonMenuItems = ['Dal', 'Rice', 'Chapatti', 'Salad', 'Raita', 'Pulav'];

export interface DailyMenu {
  lunch: string[];
  dinner: string[];
}

const today = new Date();
const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

const pastMenus: [string, DailyMenu][] = [
    [formatDateKey(subDays(today, 7)), { lunch: ['Dal Makhani', 'Naan'], dinner: ['Mix Veg', 'Roti'] }],
    [formatDateKey(subDays(today, 6)), { lunch: ['Idli Sambar', 'Chutney'], dinner: ['Masala Dosa'] }],
    [formatDateKey(subDays(today, 5)), { lunch: ['Special Thali'], dinner: ['Pasta', 'Garlic Bread'] }],
    [formatDateKey(subDays(today, 4)), { lunch: ['Puri Sabji', 'Halwa'], dinner: ['Pizza Night'] }],
    [formatDateKey(subDays(today, 3)), { lunch: ['Veg Biryani', 'Raita'], dinner: ['Kadhi Pakora', 'Rice'] }],
    [formatDateKey(subDays(today, 2)), { lunch: ['Aloo Gobi', 'Roti', 'Dal'], dinner: ['Paneer Butter Masala', 'Rice'] }],
    [formatDateKey(subDays(today, 1)), { lunch: ['Rajma Chawal', 'Salad'], dinner: ['Chole Bhature'] }],
    [formatDateKey(today), { lunch: ['Rajma Chawal', 'Salad'], dinner: ['Chole Bhature'] }],
    [formatDateKey(addDays(today, 1)), { lunch: ['Aloo Gobi', 'Roti', 'Dal'], dinner: ['Paneer Butter Masala', 'Rice'] }]
];

// Key: 'YYYY-MM-DD'
export const dailyMenus: Map<string, DailyMenu> = new Map(pastMenus);

export interface Holiday {
    date: Date;
    name: string;
}

export const holidays: Holiday[] = [
    { date: new Date(2023, 9, 2), name: 'Gandhi Jayanti' },
    { date: new Date(2023, 9, 24), name: 'Dussehra' },
    { date: new Date(2023, 10, 12), name: 'Diwali' },
    { date: new Date(2023, 11, 25), name: 'Christmas' },
];

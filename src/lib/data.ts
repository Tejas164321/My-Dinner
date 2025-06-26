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
];

export const studentBehaviorData = [
  { name: 'Regular Leaves', value: 400 },
  { name: 'Late Payments', value: 150 },
  { name: 'Meal Skips', value: 300 },
  { name: 'Special Requests', value: 200 },
];

export const joinRequests = [
    { id: '1', name: 'John Doe', studentId: 'B12345', date: '2023-10-27' },
    { id: '2', name: 'Jane Smith', studentId: 'B67890', date: '2023-10-26' },
    { id: '3', name: 'Sam Wilson', studentId: 'B54321', date: '2023-10-26' },
];

export const joinedStudents = [
    { id: '4', name: 'Peter Jones', studentId: 'B11223', joinDate: '2023-09-15' },
    { id: '5', name: 'Mary Jane', studentId: 'B44556', joinDate: '2023-09-14' },
    { id: '6', name: 'Chris Lee', studentId: 'B77889', joinDate: '2023-09-13' },
    { id: '7', name: 'Bryan Fury', studentId: 'B98765', joinDate: '2023-09-12' },
];

export const menu = {
  monday: { lunch: 'Aloo Gobi, Roti, Dal', dinner: 'Paneer Butter Masala, Rice' },
  tuesday: { lunch: 'Rajma Chawal, Salad', dinner: 'Chole Bhature' },
  wednesday: { lunch: 'Veg Biryani, Raita', dinner: 'Kadhi Pakora, Rice' },
  thursday: { lunch: 'Dal Makhani, Naan', dinner: 'Mix Veg, Roti' },
  friday: { lunch: 'Idli Sambar, Chutney', dinner: 'Masala Dosa' },
  saturday: { lunch: 'Special Thali', dinner: 'Pasta, Garlic Bread' },
  sunday: { lunch: 'Puri Sabji, Halwa', dinner: 'Pizza Night' },
}

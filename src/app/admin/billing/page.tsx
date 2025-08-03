

'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Receipt, Users, FileDown } from 'lucide-react';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { BillingTable } from '@/components/admin/billing-table';
import { onUsersUpdate } from '@/lib/listeners/users';
import { useAuth } from '@/contexts/auth-context';
import type { Student, Leave, Holiday } from '@/lib/data';
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { format, subMonths, startOfMonth, getMonth, getYear, getDaysInMonth, isSameDay, isFuture, parseISO } from 'date-fns';

const CHARGE_PER_MEAL = 65;

const calculateBillForStudent = (student: Student, month: Date, leaves: Leave[], holidays: Holiday[]) => {
    if (!student || !student.uid || !student.messPlan || !student.joinDate) return { due: 0, paid: 0, status: 'Paid' };

    const studentLeaves = leaves.filter(l => l.studentId === student.uid && getMonth(l.date) === getMonth(month));
    const messHolidays = holidays.filter(h => h.messId === student.messId && getMonth(h.date) === getMonth(month));

    const monthIndex = getMonth(month);
    const year = getYear(month);
    const daysInMonth = getDaysInMonth(month);
    const joinDate = startOfDay(parseISO(student.joinDate));
    
    let totalMeals = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, monthIndex, i);
        if (isFuture(day) || day < joinDate) continue;

        const holiday = messHolidays.find(h => isSameDay(h.date, day));
        if (holiday) continue;
        
        const leave = studentLeaves.find(l => isSameDay(l.date, day));
        if (leave) {
            if (student.messPlan === 'full_day') {
                if (leave.type === 'lunch_only') totalMeals++;
                if (leave.type === 'dinner_only') totalMeals++;
            }
        } else {
            if (student.messPlan === 'full_day') totalMeals += 2;
            else totalMeals++;
        }
    }
    
    const due = totalMeals * CHARGE_PER_MEAL;
    // Payment tracking would be implemented here. For now, paid is 0.
    const paid = 0; 
    
    return {
        due: due - paid,
        status: (due - paid) > 0 ? 'Due' : 'Paid',
        paid,
    }
};

export default function AdminBillingPage() {
  const { user: adminUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    if (!adminUser) return;
    setIsLoading(true);

    const unsubUsers = onUsersUpdate(adminUser.uid, setStudents);
    const unsubLeaves = onAllLeavesUpdate(setLeaves);
    const unsubHolidays = onHolidaysUpdate(adminUser.uid, setHolidays);

    // Consider loading finished when all data is fetched
    Promise.all([
        new Promise(res => onUsersUpdate(adminUser.uid, d => { setStudents(d); res(d); })),
        new Promise(res => onAllLeavesUpdate(d => { setLeaves(d); res(d); })),
        new Promise(res => onHolidaysUpdate(adminUser.uid, d => { setHolidays(d); res(d); }))
    ]).then(() => setIsLoading(false));

    return () => {
        unsubUsers();
        unsubLeaves();
        unsubHolidays();
    };
  }, [adminUser]);
  
  const monthOptions = useMemo(() => {
      const options = [];
      const today = new Date();
      for (let i = 0; i < 6; i++) {
          const date = startOfMonth(subMonths(today, i));
          options.push({
              value: format(date, 'yyyy-MM-dd'),
              label: format(date, 'MMMM yyyy'),
          });
      }
      return options;
  }, []);

  const stats = useMemo(() => {
    const currentMonthData = students.map(s => calculateBillForStudent(s, month, leaves, holidays));
    
    const totalRevenue = currentMonthData.reduce((sum, data) => sum + data.paid, 0);
    const pendingDues = currentMonthData.reduce((sum, data) => sum + data.due, 0);
    const defaulters = currentMonthData.filter(data => data.status === 'Due').length;

    return { totalRevenue, pendingDues, defaulters };
  }, [students, month, leaves, holidays]);

  const chartData = useMemo(() => {
    if (isLoading) return [];
    
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const monthDate = startOfMonth(subMonths(today, i));
        let monthlyRevenue = 0;

        students.forEach(student => {
            const bill = calculateBillForStudent(student, monthDate, leaves, holidays);
            // In a real system, you'd use actual paid amounts. For trend, we use total due as proxy for potential revenue.
            monthlyRevenue += bill.due;
        });

        data.push({
            month: format(monthDate, 'MMM'),
            revenue: monthlyRevenue,
        });
    }
    return data;
  }, [isLoading, students, leaves, holidays]);

  return (
    <div className="flex flex-col gap-2 md:gap-6 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Select value={format(month, 'yyyy-MM-dd')} onValueChange={(val) => setMonth(new Date(val))}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
                {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex-shrink-0">
            <FileDown className="h-4 w-4 mr-2"/>
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-6">
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 md:h-5 w-4 md:w-5 text-primary" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">Payments this month</p>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Pending Dues</CardTitle>
            <Receipt className="h-4 md:h-5 w-4 md:w-5 text-destructive" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">₹{stats.pendingDues.toLocaleString()}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">Outstanding amount</p>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Defaulters</CardTitle>
            <Users className="h-4 md:h-5 w-4 md:w-5 text-destructive" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{stats.defaulters}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">Students with dues</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Revenue Trend</CardTitle>
                        <CardDescription>An overview of revenue generated over the past months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-2">
                       <RevenueChart data={chartData} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <BillingTable filterMonth={month} students={students} leaves={leaves} holidays={holidays} isLoading={isLoading} />
            </div>
       </div>
    </div>
  );
}

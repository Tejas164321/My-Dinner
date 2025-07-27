
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
import type { Student } from '@/lib/data';

const getDummyBillForStudent = (student: Student) => {
    if (!student || !student.uid || !student.studentId) return { due: 0, status: 'Paid', paid: 0 };
    const base = student.messPlan === 'full_day' ? 3500 : 1800;
    const due = student.uid.charCodeAt(0) % 2 === 0 ? base : 0;
    const paid = base - due;
    return {
        due,
        status: due > 0 ? 'Due' : 'Paid',
        paid,
    }
};

export default function AdminBillingPage() {
  const { user: adminUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState('october');

  useEffect(() => {
    if (!adminUser) return;
    setIsLoading(true);
    const unsubscribe = onUsersUpdate(adminUser.uid, (data) => {
        setStudents(data);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [adminUser]);

  const stats = useMemo(() => {
    const currentMonthData = students.map(s => {
        const details = getDummyBillForStudent(s);
        return {
            ...details,
        };
    });
    
    const totalRevenue = currentMonthData.reduce((sum, data) => sum + data!.paid, 0);
    const pendingDues = currentMonthData.reduce((sum, data) => sum + data!.due, 0);
    const defaulters = currentMonthData.filter(data => data!.status === 'Due').length;

    return {
        totalRevenue,
        pendingDues,
        defaulters
    };
  }, [students, month]);

  return (
    <div className="flex flex-col gap-2 md:gap-6 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="october">October</SelectItem>
              <SelectItem value="september">September</SelectItem>
              <SelectItem value="august">August</SelectItem>
              <SelectItem value="july">July</SelectItem>
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
                        <CardDescription>An overview of revenue collected over the past months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-2">
                       <RevenueChart />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <BillingTable filterMonth={month} students={students} isLoading={isLoading} />
            </div>
       </div>
    </div>
  );
}

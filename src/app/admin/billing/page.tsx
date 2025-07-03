
'use client';

import { useState, useMemo } from 'react';
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
import { studentsData } from '@/lib/data';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { BillingTable } from '@/components/admin/billing-table';

export default function AdminBillingPage() {
  const [month, setMonth] = useState('october');

  const stats = useMemo(() => {
    const currentMonthData = studentsData.map(s => {
        const details = s.monthlyDetails[month as keyof typeof s.monthlyDetails];
        if (!details) return null;

        const paid = details.bill.payments.reduce((sum, p) => sum + p.amount, 0);
        const due = details.bill.total - paid;
        const status = due <= 0 ? 'Paid' : 'Due';
        
        return {
            ...details,
            paid,
            due,
            status
        };
    }).filter(Boolean);
    
    const totalRevenue = currentMonthData.reduce((sum, data) => sum + data!.paid, 0);
    const pendingDues = currentMonthData.reduce((sum, data) => sum + data!.due, 0);
    const defaulters = currentMonthData.filter(data => data!.status === 'Due').length;

    return {
        totalRevenue,
        pendingDues,
        defaulters
    };
  }, [month]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="october">October</SelectItem>
              <SelectItem value="september">September</SelectItem>
              <SelectItem value="august">August</SelectItem>
              <SelectItem value="july">July</SelectItem>
            </SelectContent>
          </Select>
           <Button variant="outline"><FileDown /> Export Data</Button>
           <Button>Generate Bills</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue ({month.charAt(0).toUpperCase() + month.slice(1)})</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total payments received this month</p>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues ({month.charAt(0).toUpperCase() + month.slice(1)})</CardTitle>
            <Receipt className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingDues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total outstanding amount from students</p>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defaulters ({month.charAt(0).toUpperCase() + month.slice(1)})</CardTitle>
            <Users className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.defaulters}</div>
            <p className="text-xs text-muted-foreground">Students with pending payments</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
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
                 <BillingTable filterMonth={month} />
            </div>
       </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { StudentsTable } from '@/components/admin/students-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AdminStudentsPage() {
  const [month, setMonth] = useState('october');
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plan, setPlan] = useState('all');

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="october">October</SelectItem>
              <SelectItem value="september">September</SelectItem>
              <SelectItem value="august">August</SelectItem>
              <SelectItem value="july">July</SelectItem>
            </SelectContent>
          </Select>
           <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Due">Due</SelectItem>
            </SelectContent>
          </Select>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="full_day">Full Day</SelectItem>
              <SelectItem value="lunch_only">Lunch Only</SelectItem>
              <SelectItem value="dinner_only">Dinner Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <StudentsTable filterMonth={month} filterStatus={status} searchQuery={searchQuery} filterPlan={plan} />
    </div>
  );
}

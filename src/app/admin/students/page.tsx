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

export default function AdminStudentsPage() {
  const [month, setMonth] = useState('october');
  const [status, setStatus] = useState('all');

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Approve new student requests and manage existing students.</p>
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
           <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Due">Due</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <StudentsTable filterMonth={month} filterStatus={status} />
    </div>
  );
}

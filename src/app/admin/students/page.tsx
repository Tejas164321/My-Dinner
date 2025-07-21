
'use client';

import { useState, useMemo, useEffect } from 'react';
import { StudentsTable } from '@/components/admin/students-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Search, SlidersHorizontal } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function AdminStudentsPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plan, setPlan] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
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

  const handleMonthChange = (value: string) => {
      setCurrentMonth(new Date(value));
  };
  
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (status !== 'all') count++;
    if (plan !== 'all') count++;
    return count;
  }, [status, plan]);
  
  const resetFilters = () => {
    setStatus('all');
    setPlan('all');
    setCurrentMonth(startOfMonth(new Date()));
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight hidden md:block">Student Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filter
                      {activeFilterCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">{activeFilterCount}</Badge>
                      )}
                  </Button>
              </SheetTrigger>
              <SheetContent>
                  <SheetHeader>
                      <SheetTitle>Filter Students</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                      <div className="space-y-2">
                          <Label>Month</Label>
                          <Select value={format(currentMonth, 'yyyy-MM-dd')} onValueChange={handleMonthChange}>
                              <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                              <SelectContent>
                                  {monthOptions.map(option => (
                                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                       <div className="space-y-2">
                          <Label>Payment Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Statuses</SelectItem>
                                  <SelectItem value="Paid">Paid</SelectItem>
                                  <SelectItem value="Due">Due</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                       <div className="space-y-2">
                          <Label>Meal Plan</Label>
                           <Select value={plan} onValueChange={setPlan}>
                              <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Plans</SelectItem>
                                  <SelectItem value="full_day">Full Day</SelectItem>
                                  <SelectItem value="lunch_only">Lunch Only</SelectItem>
                                  <SelectItem value="dinner_only">Dinner Only</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <SheetFooter className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={resetFilters}>Reset</Button>
                      <Button onClick={() => setIsSheetOpen(false)}>Apply</Button>
                  </SheetFooter>
              </SheetContent>
          </Sheet>
        </div>
      </div>
      <StudentsTable filterMonth={currentMonth} filterStatus={status} searchQuery={searchQuery} filterPlan={plan} />
    </div>
  );
}

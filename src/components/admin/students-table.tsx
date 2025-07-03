
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { studentsData, joinRequests, monthMap, Student, planChangeRequests } from "@/lib/data";
import { Check, X, Trash2, UserX, Search, Utensils, Sun, Moon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentDetailCard } from "./student-detail-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';

interface StudentsTableProps {
    filterMonth: string;
    filterStatus: string;
    searchQuery: string;
    filterPlan: string;
}

const planInfo = {
    full_day: { icon: Utensils, text: 'Full Day', color: 'text-primary' },
    lunch_only: { icon: Sun, text: 'Lunch Only', color: 'text-yellow-400' },
    dinner_only: { icon: Moon, text: 'Dinner Only', color: 'text-purple-400' }
};

const StudentRowCard = ({ student, month, initialDate, showActions }: { student: Student, month: string, initialDate: Date, showActions: boolean }) => {
    const monthDetails = student.monthlyDetails[month as keyof typeof student.monthlyDetails];
    const billAmount = monthDetails.bill.total - monthDetails.bill.paid;
    const billDisplay = billAmount > 0 ? `₹${billAmount.toLocaleString()}` : '₹0';
    const currentPlan = planInfo[student.messPlan];
    const PlanIcon = currentPlan.icon;
    
    return (
        <Dialog>
            <Card className={cn("hover:border-primary/50 hover:shadow-lg transition-all duration-150 group animate-in fade-in-0", !showActions && "opacity-70")}>
                <CardContent className="p-3 flex items-center gap-4">
                    <DialogTrigger asChild>
                        <div className="flex-1 flex items-center gap-4 cursor-pointer">
                            <Avatar className="w-12 h-12 border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors">
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                                <div className="sm:col-span-2">
                                    <h3 className="font-semibold text-base">{student.name}</h3>
                                    <p className="text-sm text-muted-foreground">{student.studentId}</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-xs text-muted-foreground">Plan</p>
                                    <Badge variant="outline" className="font-semibold">
                                        <PlanIcon className={cn("mr-1.5 h-4 w-4", currentPlan.color)} />
                                        {currentPlan.text}
                                    </Badge>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-xs text-muted-foreground">Attendance</p>
                                    <p className="font-semibold">{monthDetails.attendance}</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-xs text-muted-foreground">Bill</p>
                                    <Badge variant={monthDetails.status === 'Paid' ? 'secondary' : 'destructive'} className={cn(monthDetails.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{billDisplay}</Badge>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-xs text-muted-foreground">Joined</p>
                                    <p className="font-semibold">{student.joinDate}</p>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>

                    {showActions && (
                        <div className="flex items-center gap-2">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <UserX className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Suspend {student.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will move the student to the suspended list. They will no longer have access, but their data will be kept for historical purposes. Are you sure?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction>Suspend</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Permanently Delete {student.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action is irreversible. All data associated with this student will be permanently deleted. Are you sure you want to proceed?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className={cn(buttonVariants({variant: "destructive"}))}>Delete Permanently</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
            <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
                <DialogHeader className="sr-only">
                    <DialogTitle>Student Details: {student.name}</DialogTitle>
                    <DialogDescription>
                        Detailed information for {student.name}, including personal info, attendance, and billing.
                    </DialogDescription>
                </DialogHeader>
                <StudentDetailCard student={student} initialMonth={initialDate} />
            </DialogContent>
        </Dialog>
    );
};


export function StudentsTable({ filterMonth, filterStatus, searchQuery, filterPlan }: StudentsTableProps) {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab');

    const { activeStudents, suspendedStudents } = useMemo(() => {
        const active: Student[] = [];
        const suspended: Student[] = [];
        studentsData.forEach(student => {
            (student.status === 'suspended' ? suspended : active).push(student);
        });
        return { activeStudents: active, suspendedStudents: suspended };
    }, []);

    const filteredActiveStudents = useMemo(() => {
        return activeStudents
            .filter(student => {
                if (filterStatus === 'all') return true;
                const monthDetails = student.monthlyDetails[filterMonth as keyof typeof student.monthlyDetails];
                return monthDetails?.status === filterStatus;
            })
             .filter(student => {
                if (filterPlan === 'all') return true;
                return student.messPlan === filterPlan;
            })
            .filter(student => {
                if (!searchQuery) return true;
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = student.name.toLowerCase().includes(searchLower);
                const idMatch = student.studentId.toLowerCase().includes(searchLower);
                return nameMatch || idMatch;
            });
    }, [activeStudents, filterMonth, filterStatus, searchQuery, filterPlan]);
    
    const initialDate = useMemo(() => monthMap[filterMonth], [filterMonth]);

    const formatPlanName = (plan: string) => {
        return plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <Tabs defaultValue={tab || "joined"} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="joined">All Students</TabsTrigger>
                        <TabsTrigger value="requests">Join Requests <Badge variant="secondary" className="ml-2">{joinRequests.length}</Badge></TabsTrigger>
                        <TabsTrigger value="plan_requests">Plan Requests <Badge variant="secondary" className="ml-2">{planChangeRequests.length}</Badge></TabsTrigger>
                        <TabsTrigger value="suspended">Suspended <Badge variant="secondary" className="ml-2">{suspendedStudents.length}</Badge></TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="joined" className="mt-4">
                        <div className="flex flex-col gap-4">
                            {filteredActiveStudents.length > 0 ? (
                                filteredActiveStudents.map((student) => (
                                   <StudentRowCard key={student.id} student={student} month={filterMonth} initialDate={initialDate} showActions={true} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                    <Search className="h-10 w-10 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground">No Students Found</h3>
                                    <p>Your search and filter combination did not match any students.</p>
                                    <p>Try adjusting your filters.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                     <TabsContent value="suspended" className="mt-4">
                        <div className="flex flex-col gap-4">
                            {suspendedStudents.map((student) => (
                               <StudentRowCard key={student.id} student={student} month={filterMonth} initialDate={initialDate} showActions={false} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="requests" className="mt-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {joinRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.name}</TableCell>
                                            <TableCell>{req.studentId}</TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="plan_requests" className="mt-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Current Plan</TableHead>
                                        <TableHead>Requested Plan</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {planChangeRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.studentName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{formatPlanName(req.fromPlan)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge>{formatPlanName(req.toPlan)}</Badge>
                                            </TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                </Tabs>
            </CardContent>
        </Card>
    );
}

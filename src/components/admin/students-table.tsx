

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Student, Leave, PlanChangeRequest, Holiday } from "@/lib/data";
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onUsersUpdate } from '@/lib/listeners/users';
import { onPlanChangeRequestsUpdate } from '@/lib/listeners/requests';
import { Users, Check, X, Trash2, UserX, Search, Utensils, Sun, Moon, RotateCcw, Loader2, GitCompareArrows, UserPlus, ShieldX, History } from "lucide-react";
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
} from "@/components/ui/dialog";
import { StudentDetailCard } from "./student-detail-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { format, parseISO, isFuture, getMonth, getYear, getDaysInMonth, isSameDay, startOfMonth, isSameMonth, startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMessInfo } from '@/lib/services/mess';
import { leaveMessAction } from '@/lib/actions/user';

interface StudentsTableProps {
    filterMonth: Date;
    filterStatus: string;
    searchQuery: string;
    filterPlan: string;
}

// Client-side Firestore actions
async function approveStudent(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: 'pending_start' });
}

async function rejectStudent(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: 'rejected' });
}

async function suspendStudent(studentDocId: string) {
    const userRef = doc(db, 'users', studentDocId);
    // Only change the status. Keep messId and messName for history and re-request functionality.
    await updateDoc(userRef, { 
        status: 'suspended',
    });
}

async function reactivateStudent(studentDocId: string) {
    const userRef = doc(db, 'users', studentDocId);
    await updateDoc(userRef, { status: 'active' });
}

async function removeStudentFromMess(studentDocId: string) {
    const userRef = doc(db, 'users', studentDocId);
    // This is a "soft delete" for the admin view. The user can rejoin.
    await leaveMessAction(studentDocId);
}

async function approvePlanChangeRequest(requestId: string, studentUid: string, toPlan: Student['messPlan']) {
    const userRef = doc(db, 'users', studentUid);
    const requestRef = doc(db, 'planChangeRequests', requestId);

    const batch = writeBatch(db);
    batch.update(userRef, { messPlan: toPlan });
    batch.delete(requestRef);

    await batch.commit();
}

async function rejectPlanChangeRequest(requestId: string) {
    const requestRef = doc(db, 'planChangeRequests', requestId);
    await deleteDoc(requestRef);
}

const planInfo = {
    full_day: { icon: Utensils, text: 'Full Day', color: 'text-primary' },
    lunch_only: { icon: Sun, text: 'Lunch Only', color: 'text-yellow-400' },
    dinner_only: { icon: Moon, text: 'Dinner Only', color: 'text-purple-400' }
};

const calculateBillForStudent = (student: Student, month: Date, leaves: Leave[], holidays: Holiday[], perMealCharge: number) => {
    if (!student || !student.uid || !student.messPlan || !student.joinDate) return { due: 0, attendance: 'N/A', status: 'Paid' };

    const studentLeaves = leaves.filter(l => l.studentId === student.uid && isSameMonth(l.date, month));
    const messHolidays = holidays.filter(h => h.messId === student.messId && isSameMonth(h.date, month));

    const monthIndex = getMonth(month);
    const year = getYear(month);
    const daysInMonth = getDaysInMonth(month);
    const joinDate = startOfDay(parseISO(student.joinDate));
    
    let totalMeals = 0;
    let presentDays = 0;
    let totalCountedDays = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, monthIndex, i);
        if (isFuture(day) || day < joinDate) continue;

        const holiday = messHolidays.find(h => isSameDay(h.date, day));
        if (holiday) continue;
        
        totalCountedDays++;
        const leave = studentLeaves.find(l => isSameDay(l.date, day));

        if (leave) {
            if (student.messPlan === 'full_day') {
                if (leave.type === 'lunch_only') totalMeals++;
                if (leave.type === 'dinner_only') totalMeals++;
            }
        } else {
            presentDays++;
            if (student.messPlan === 'full_day') totalMeals += 2;
            else totalMeals++;
        }
    }
    
    const totalDue = totalMeals * perMealCharge;
    const attendance = totalCountedDays > 0 ? `${Math.round((presentDays / totalCountedDays) * 100)}%` : 'N/A';

    return {
        due: totalDue,
        attendance,
        status: totalDue > 0 ? 'Due' : 'Paid',
    };
};

const StudentRowCard = ({ student, bill, showActions, onOpenDialog }: { student: Student, bill: any, showActions: boolean, onOpenDialog: () => void }) => {
    const billDisplay = `₹${bill.due.toLocaleString()}`;
    const currentPlan = planInfo[student.messPlan];
    const PlanIcon = currentPlan.icon;
    
    return (
        <div className={cn("p-3 flex items-center gap-3 border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-all duration-150 group animate-in fade-in-0", !showActions && "opacity-70")}>
            <button onClick={onOpenDialog} className="flex-1 flex items-center gap-3 cursor-pointer text-left w-full">
                <Avatar className="w-10 h-10 border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors">
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center gap-x-4">
                    {/* --- Mobile View --- */}
                    <div className="md:hidden col-span-1 flex justify-between items-center w-full">
                         <div>
                            <h3 className="font-semibold text-base truncate">{student.name}</h3>
                            <p className="text-xs text-muted-foreground">{student.studentId}</p>
                        </div>
                        <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn('text-xs py-0.5 px-1.5 h-auto', bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>
                            Due: {billDisplay}
                        </Badge>
                    </div>

                    {/* --- Desktop View --- */}
                    <div className="hidden md:block md:col-span-1">
                        <h3 className="font-semibold text-base truncate">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-xs text-muted-foreground">Plan</p>
                        <Badge variant="outline" className="font-semibold">
                            <PlanIcon className={cn("mr-1.5 h-4 w-4", currentPlan.color)} />
                            {currentPlan.text}
                        </Badge>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p className="font-semibold">{bill.attendance}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-xs text-muted-foreground">Bill Due</p>
                         <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn('text-xs', bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{billDisplay}</Badge>
                    </div>
                </div>
            </button>

            {showActions ? (
                <div className="flex items-center gap-0 md:gap-1">
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
                                    This will move the student to the suspended list. They will be logged out and must re-apply to join again. Are you sure?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => suspendStudent(student.uid)}>Suspend</AlertDialogAction>
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
                                <AlertDialogTitle>Remove {student.name} From Mess?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will mark the student as 'Left' and clear their mess affiliation, allowing them to join another mess. Their historical data will be preserved. Are you sure?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeStudentFromMess(student.uid)} className={cn(buttonVariants({variant: "destructive"}))}>Confirm & Remove</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => reactivateStudent(student.uid)} variant="ghost" size="icon" className="h-9 w-9 text-green-400 hover:text-green-300 hover:bg-green-500/10">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Re-activate Student</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
};


export function StudentsTable({ filterMonth, filterStatus, searchQuery, filterPlan }: StudentsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [openStudentId, setOpenStudentId] = useState<string | null>(null);

    useEffect(() => {
        const studentId = searchParams.get('view');
        setOpenStudentId(studentId);
    }, [searchParams]);
    
    const handleOpenDialog = (studentId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', studentId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCloseDialog = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('view');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const tab = searchParams.get('tab') || "joined";
    
    const { user } = useAuth();
    const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
    const [allHolidays, setAllHolidays] = useState<Holiday[]>([]);
    const [users, setUsers] = useState<Student[]>([]);
    const [planChangeRequests, setPlanChangeRequests] = useState<PlanChangeRequest[]>([]);
    const [perMealCharge, setPerMealCharge] = useState(65);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.uid) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);

        const fetchMessSettings = async () => {
            const messInfo = await getMessInfo(user.uid);
            if (messInfo?.perMealCharge) {
                setPerMealCharge(messInfo.perMealCharge);
            }
        };

        const unsubscribes = [
            fetchMessSettings(),
            onUsersUpdate(user.uid, setUsers),
            onPlanChangeRequestsUpdate(user.uid, setPlanChangeRequests),
            onAllLeavesUpdate(setAllLeaves),
            onHolidaysUpdate(user.uid, setAllHolidays)
        ];

        // This is a simplified way to set loading state.
        // A more robust solution might track loading for each listener individually.
        Promise.all([
            new Promise(res => onUsersUpdate(user.uid, d => res(d))),
            new Promise(res => onPlanChangeRequestsUpdate(user.uid, d => res(d))),
            new Promise(res => onAllLeavesUpdate(d => res(d))),
            new Promise(res => onHolidaysUpdate(user.uid, d => res(d))),
        ]).then(() => setIsLoading(false));

        return () => unsubscribes.forEach(unsub => typeof unsub === 'function' && unsub());
    }, [user]);

    const { activeStudents, historicalStudents, pendingStudents } = useMemo(() => {
        const activeList: Student[] = [];
        const historicalList: Student[] = [];
        const pendingList: Student[] = [];
        
        users.forEach(student => {
            if (student.status === 'suspended' || student.status === 'left') {
                historicalList.push(student);
            } else if (student.status === 'pending_approval') {
                pendingList.push(student);
            } else if (student.status === 'active' || student.status === 'pending_start') {
                activeList.push(student);
            }
        });

        return { activeStudents: activeList, historicalStudents: historicalList, pendingStudents: pendingList };
    }, [users]);

    const filteredActiveStudents = useMemo(() => {
        return activeStudents.map(student => ({
                student,
                bill: calculateBillForStudent(student, filterMonth, allLeaves, allHolidays, perMealCharge),
            }))
            .filter(({ bill }) => filterStatus === 'all' || bill.status === filterStatus)
            .filter(({ student }) => filterPlan === 'all' || student.messPlan === filterPlan)
            .filter(({ student }) => {
                if (!searchQuery) return true;
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = student.name.toLowerCase().includes(searchLower);
                const idMatch = student.studentId && student.studentId.toLowerCase().includes(searchLower);
                return nameMatch || idMatch;
            });
    }, [activeStudents, filterStatus, searchQuery, filterPlan, filterMonth, allLeaves, allHolidays, perMealCharge]);
    
    const formatPlanName = (plan: string) => {
        return plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const tabsConfig = [
        { value: "joined", label: "Students", icon: Users, data: activeStudents, badgeVariant: 'secondary' as const },
        { value: "requests", label: "Requests", icon: UserPlus, data: pendingStudents, badgeVariant: pendingStudents.length > 0 ? 'destructive' : 'secondary' },
        { value: "plan_requests", label: "Plan", icon: GitCompareArrows, data: planChangeRequests, badgeVariant: planChangeRequests.length > 0 ? 'destructive' : 'secondary' },
        { value: "historical", label: "Historical", icon: History, data: historicalStudents, badgeVariant: 'secondary' as const },
    ];

    const studentToView = openStudentId ? users.find(s => s.uid === openStudentId) : null;
    const leavesForStudent = studentToView ? allLeaves.filter(l => l.studentId === studentToView.uid) : [];

    return (
        <div>
            <Tabs value={tab} onValueChange={(value) => router.push(`${pathname}?tab=${value}`)} className="w-full">
                 <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                    {tabsConfig.map((tabItem) => (
                        <TooltipProvider key={tabItem.value}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value={tabItem.value} className="flex-col h-auto py-2 px-1 text-xs md:flex-row md:gap-2 md:text-sm">
                                        <div className="relative">
                                            <tabItem.icon className="h-5 w-5 mb-1 md:mb-0" />
                                            {tabItem.data.length > 0 && (
                                                <Badge variant={tabItem.badgeVariant} className="absolute -top-2 -right-2 h-4 w-4 p-0 min-w-4 justify-center text-[10px] rounded-full">
                                                    {tabItem.data.length}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-medium md:text-sm">{tabItem.label}</span>
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{tabItem.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </TabsList>
                
                <TabsContent value="joined" className="mt-4">
                    <div className="flex flex-col gap-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
                        ) : filteredActiveStudents.length > 0 ? (
                            filteredActiveStudents.map(({ student, bill }) => (
                               <StudentRowCard 
                                    key={student.uid} 
                                    student={student} 
                                    bill={bill}
                                    showActions={true} 
                                    onOpenDialog={() => handleOpenDialog(student.uid)}
                                />
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
                
                <TabsContent value="requests" className="mt-4">
                    <div className="overflow-x-auto border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                                ) : pendingStudents.length > 0 ? (
                                    pendingStudents.map((req) => (
                                        <TableRow key={req.uid}>
                                            <TableCell className="font-medium">{req.name}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{req.email}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{req.joinDate ? format(parseISO(req.joinDate), 'MMM do, yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button onClick={() => approveStudent(req.uid)} variant="ghost" size="icon" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => rejectStudent(req.uid)} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No pending join requests.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="plan_requests" className="mt-4">
                    <div className="overflow-x-auto border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                                ) : planChangeRequests.length > 0 ? (
                                    planChangeRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.studentName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{formatPlanName(req.fromPlan)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge>{formatPlanName(req.toPlan)}</Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">{req.date ? format(parseISO(req.date), 'MMM do, yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button onClick={() => approvePlanChangeRequest(req.id, req.studentUid, req.toPlan)} variant="ghost" size="icon" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => rejectPlanChangeRequest(req.id)} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                 ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No pending plan change requests.</TableCell></TableRow>
                                 )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                 <TabsContent value="historical" className="mt-4">
                    <div className="flex flex-col gap-3">
                         {isLoading ? (
                            Array.from({ length: 1 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
                        ) : historicalStudents.length > 0 ? (
                            historicalStudents.map((student) => (
                            <StudentRowCard 
                                    key={student.uid} 
                                    student={student}
                                    bill={calculateBillForStudent(student, filterMonth, allLeaves, allHolidays, perMealCharge)} 
                                    showActions={false}
                                    onOpenDialog={() => handleOpenDialog(student.uid)}
                                />
                            ))
                         ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                <p>No suspended or left students.</p>
                            </div>
                         )}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={!!studentToView} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent className="p-0 w-[90vw] max-w-[500px] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                     {studentToView && (
                        <StudentDetailCard 
                            student={studentToView} 
                            leaves={leavesForStudent} 
                            initialMonth={filterMonth} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

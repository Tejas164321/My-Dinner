

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Student, Leave, PlanChangeRequest, Holiday, AppUser } from "@/lib/data";
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onUsersUpdate } from '@/lib/listeners/users';
import { onPlanChangeRequestsUpdate } from '@/lib/listeners/requests';
import { Users, Check, X, UserX, Search, Utensils, Sun, Moon, RotateCcw, Loader2, GitCompareArrows, UserPlus, ShieldX, Trash2 } from "lucide-react";
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
import { doc, updateDoc, deleteDoc, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMessInfo } from '@/lib/services/mess';
import { leaveMessAction, deleteStudentHistory } from '@/lib/actions/user';
import { useToast } from '@/hooks/use-toast';

interface StudentsTableProps {
    filterMonth: Date;
    filterStatus: string;
    searchQuery: string;
    filterPlan: string;
}

// --- Client-side Firestore Actions ---

async function approveStudent(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: 'pending_start' });
}

async function rejectStudent(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: 'rejected' });
}

async function suspendStudent(student: Student) {
    if (!student || !student.uid || !student.messId) return;
    
    const userRef = doc(db, 'users', student.uid);
    // Create a new ref in the historical collection. Keyed by messId + userId for uniqueness.
    const historicalDocRef = doc(db, 'suspended_students', `${student.messId}_${student.uid}`);
    
    const batch = writeBatch(db);

    // 1. Copy the current student data to the historical collection
    batch.set(historicalDocRef, { 
        ...student, 
        status: 'suspended', 
        leaveDate: new Date().toISOString() 
    });

    // 2. Update the original user doc to be unaffiliated
    batch.update(userRef, {
        status: 'unaffiliated',
        messId: null,
        messName: null,
        planStartDate: null,
        planStartMeal: null,
        studentId: null,
        joinDate: null,
    });
    
    await batch.commit();
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

// Calculation logic...
const calculateBillForStudent = (student: Student, month: Date, leaves: Leave[], holidays: Holiday[], perMealCharge: number) => {
    const dateValue = student.planStartDate;
    if (!student || !student.uid || !student.messPlan || !dateValue) {
        return { due: 0, attendance: 'N/A', status: 'Paid' };
    }

    const planStartDate = typeof dateValue === 'string'
        ? startOfDay(parseISO(dateValue))
        : startOfDay((dateValue as any).toDate());

    const studentLeaves = leaves.filter(l => l.studentId === student.uid && getMonth(l.date) === getMonth(month));
    const messHolidays = holidays.filter(h => h.messId === student.messId && getMonth(h.date) === getMonth(month));

    const monthIndex = getMonth(month);
    const year = getYear(month);
    const daysInMonth = getDaysInMonth(month);
    
    let totalMeals = 0;
    let presentDays = 0;
    let totalCountedDays = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, monthIndex, i);
        if (isFuture(day) || day < planStartDate) continue;

        const holiday = messHolidays.find(h => isSameDay(h.date, day));
        if (holiday) continue;
        
        totalCountedDays++;
        const leave = studentLeaves.find(l => isSameDay(l.date, day));

        let lunchTaken = false;
        let dinnerTaken = false;

        // Check for Lunch
        if (student.messPlan === 'full_day' || student.messPlan === 'lunch_only') {
            if (!(isSameDay(day, planStartDate) && student.planStartMeal === 'dinner')) {
                if (!leave || (leave.type !== 'full_day' && leave.type !== 'lunch_only')) {
                    lunchTaken = true;
                }
            }
        }
        
        // Check for Dinner
        if (student.messPlan === 'full_day' || student.messPlan === 'dinner_only') {
            if (!leave || (leave.type !== 'full_day' && leave.type !== 'dinner_only')) {
                dinnerTaken = true;
            }
        }
        
        if(lunchTaken) totalMeals++;
        if(dinnerTaken) totalMeals++;
        if(lunchTaken || dinnerTaken) presentDays++;
    }
    
    const totalDue = totalMeals * perMealCharge;
    const attendance = totalCountedDays > 0 ? `${Math.round((presentDays / totalCountedDays) * 100)}%` : 'N/A';

    return {
        due: totalDue,
        attendance,
        status: totalDue > 0 ? 'Due' : 'Paid',
    };
};

const StudentRowCard = ({ student, bill, tab, onOpenDialog }: { student: Student, bill: any, tab: string, onOpenDialog: () => void }) => {
    const {toast} = useToast();

    const handleDataCleanup = async (student: AppUser) => {
        try {
            await deleteStudentHistory(student);
            toast({ title: 'Student Data Cleared', description: `${student.name}'s mess data has been deleted. They can now join a mess again.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Cleanup Failed', description: 'Could not clear the student data.' });
        }
    };

    const billDisplay = `₹${bill.due.toLocaleString()}`;
    const planDetails = student.messPlan ? planInfo[student.messPlan] : planInfo.full_day;
    const PlanIcon = planDetails.icon;
    
    return (
        <div className="p-3 flex items-center gap-3 border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-all duration-150 group animate-in fade-in-0">
            <button onClick={onOpenDialog} className="flex-1 flex items-center gap-3 cursor-pointer text-left w-full">
                <Avatar className="w-10 h-10 border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors">
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center gap-x-4">
                    <div className="md:hidden col-span-1 flex justify-between items-center w-full">
                         <div>
                            <h3 className="font-semibold text-base truncate">{student.name}</h3>
                            <p className="text-xs text-muted-foreground">{student.studentId}</p>
                        </div>
                        <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn('text-xs py-0.5 px-1.5 h-auto', bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>
                            Due: {billDisplay}
                        </Badge>
                    </div>

                    <div className="hidden md:block md:col-span-1">
                        <h3 className="font-semibold text-base truncate">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-xs text-muted-foreground">Plan</p>
                        <Badge variant="outline" className="font-semibold">
                            <PlanIcon className={cn("mr-1.5 h-4 w-4", planDetails.color)} />
                            {planDetails.text}
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

            {tab === 'joined' && (
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
                                    This action will move the student to the historical records. They will be logged out and must re-apply to join again. Are you sure?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => suspendStudent(student)}>Suspend</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
             {tab === 'historical' && (
                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear History for {student.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will delete all of this student's mess data (leaves, notifications, etc.) and reset their account to 'unaffiliated'. Their login will not be deleted. This allows them to start fresh. This action is irreversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDataCleanup(student)} className={cn(buttonVariants({ variant: "destructive" }))}>
                                    Clear History
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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

    const { user } = useAuth();
    const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
    const [allHolidays, setAllHolidays] = useState<Holiday[]>([]);
    const [users, setUsers] = useState<Student[]>([]);
    const [historicalUsers, setHistoricalUsers] = useState<Student[]>([]);
    const [planChangeRequests, setPlanChangeRequests] = useState<PlanChangeRequest[]>([]);
    const [perMealCharge, setPerMealCharge] = useState(65);
    
    const [isLoading, setIsLoading] = useState(true);
    
    // State to hold all categorized and filtered data
    const [processedStudents, setProcessedStudents] = useState<{
        active: any[];
        pending: Student[];
        historical: any[];
    }>({ active: [], pending: [], historical: [] });

    useEffect(() => {
        const studentId = searchParams.get('view');
        setOpenStudentId(studentId);
    }, [searchParams]);

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
            onUsersUpdate(user.uid, (users, historicalUsers) => {
                setUsers(users);
                setHistoricalUsers(historicalUsers);
                setIsLoading(false);
            }),
            onPlanChangeRequestsUpdate(user.uid, setPlanChangeRequests),
            onAllLeavesUpdate(setAllLeaves),
            onHolidaysUpdate(user.uid, setAllHolidays)
        ];

        return () => unsubscribes.forEach(unsub => typeof unsub === 'function' && unsub());
    }, [user]);

    // This useEffect hook is now the single source of truth for processing and filtering data.
    useEffect(() => {
        // 1. Categorize users based on their status
        const active: Student[] = [];
        const pending: Student[] = [];
        
        users.forEach(student => {
            if (student.status === 'pending_approval') {
                pending.push(student);
            } else if (student.status === 'active' || student.status === 'pending_start') {
                active.push(student);
            }
        });
        
        // 2. Apply filters to the active students list
        const filteredActive = active
            .map(student => ({
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

        const filteredHistorical = historicalUsers.filter((student) => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            const nameMatch = student.name.toLowerCase().includes(searchLower);
            const idMatch = student.studentId && student.studentId.toLowerCase().includes(searchLower);
            return nameMatch || idMatch;
        });
        
        // 3. Update the single state object with the processed data
        setProcessedStudents({ active: filteredActive, pending, historical: filteredHistorical });
    }, [users, historicalUsers, filterMonth, filterStatus, searchQuery, filterPlan, allLeaves, allHolidays, perMealCharge]);


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

    const formatPlanName = (plan: string) => {
        return plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const tabsConfig = [
        { value: "joined", label: "Students", icon: Users, data: processedStudents.active, badgeVariant: 'secondary' as const },
        { value: "requests", label: "Requests", icon: UserPlus, data: processedStudents.pending, badgeVariant: processedStudents.pending.length > 0 ? 'destructive' : 'secondary' },
        { value: "plan_requests", label: "Plan Changes", icon: GitCompareArrows, data: planChangeRequests, badgeVariant: planChangeRequests.length > 0 ? 'destructive' : 'secondary' },
        { value: "historical", label: "Historical", icon: ShieldX, data: processedStudents.historical, badgeVariant: 'secondary' as const },
    ];

    const studentToView = openStudentId ? users.find(s => s.uid === openStudentId) || historicalUsers.find(s => s.uid === openStudentId) : null;
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
                        ) : processedStudents.active.length > 0 ? (
                            processedStudents.active.map(({ student, bill }) => (
                               <StudentRowCard 
                                    key={student.uid} 
                                    student={student} 
                                    bill={bill}
                                    tab="joined"
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
                                    <TableHead className="hidden sm:table-cell">Requested Plan</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                                ) : processedStudents.pending.length > 0 ? (
                                    processedStudents.pending.map((req) => {
                                        const planDetails = planInfo[req.messPlan || 'full_day'];
                                        const PlanIcon = planDetails.icon;
                                        return (
                                            <TableRow key={req.uid}>
                                                <TableCell className="font-medium">{req.name}</TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant="outline" className="font-semibold">
                                                        <PlanIcon className={cn("mr-1.5 h-4 w-4", planDetails.color)} />
                                                        {planDetails.text}
                                                    </Badge>
                                                </TableCell>
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
                                        )
                                    })
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
                        ) : processedStudents.historical.length > 0 ? (
                            processedStudents.historical.map((student) => (
                            <StudentRowCard 
                                    key={student.id} 
                                    student={student}
                                    bill={calculateBillForStudent(student, filterMonth, allLeaves, allHolidays, perMealCharge)} 
                                    tab="historical"
                                    onOpenDialog={() => handleOpenDialog(student.uid)}
                                />
                            ))
                         ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                <p>No suspended or historical students.</p>
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
                            perMealCharge={perMealCharge}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}


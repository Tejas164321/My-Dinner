

'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Student, Leave, PlanChangeRequest } from "@/lib/data";
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { onUsersUpdate } from '@/lib/listeners/users';
import { onPlanChangeRequestsUpdate } from '@/lib/listeners/requests';
import { Users, Check, X, Trash2, UserX, Search, Utensils, Sun, Moon, RotateCcw, Loader2, GitCompareArrows, UserPlus, ShieldX } from "lucide-react";
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
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StudentsTableProps {
    filterMonth: Date;
    filterStatus: string;
    searchQuery: string;
    filterPlan: string;
}

// Client-side Firestore actions
async function approveStudent(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: 'active' });
}

async function rejectStudent(userId: string) {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
}

async function suspendStudent(studentDocId: string) {
    const userRef = doc(db, 'users', studentDocId);
    await updateDoc(userRef, { status: 'suspended' });
}

async function reactivateStudent(studentDocId: string) {
    const userRef = doc(db, 'users', studentDocId);
    await updateDoc(userRef, { status: 'active' });
}

async function deleteStudent(studentDocId: string) {
    const userRef = doc(db, 'users', studentDocId);
    await deleteDoc(userRef);
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

const getDummyBillForStudent = (student: Student) => {
    if (!student || !student.uid || !student.studentId) return { due: 0, attendance: 'N/A', status: 'Paid' };
    const base = student.messPlan === 'full_day' ? 3500 : 1800;
    const due = student.uid.charCodeAt(0) % 2 === 0 ? base : 0; // consistent dummy due
    const attendancePercentage = student.studentId ? `${90 + parseInt(student.studentId.slice(-1), 16) % 10}%` : 'N/A';
    return {
        due,
        attendance: attendancePercentage,
        status: due > 0 ? 'Due' : 'Paid',
    }
};

const StudentRowCard = ({ student, showActions, onOpenDialog }: { student: Student, showActions: boolean, onOpenDialog: () => void }) => {
    const dummyBill = getDummyBillForStudent(student);
    const billDisplay = `₹${dummyBill.due.toLocaleString()}`;
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
                        <Badge variant={dummyBill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn('text-xs py-0.5 px-1.5 h-auto', dummyBill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>
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
                        <p className="font-semibold">{dummyBill.attendance}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-xs text-muted-foreground">Bill Due</p>
                         <Badge variant={dummyBill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn('text-xs', dummyBill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{billDisplay}</Badge>
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
                                    This will move the student to the suspended list. They will no longer have access, but their data will be kept for historical purposes. Are you sure?
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
                                <AlertDialogTitle>Permanently Delete {student.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action is irreversible. All data associated with this student will be permanently deleted. Are you sure you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteStudent(student.uid)} className={cn(buttonVariants({variant: "destructive"}))}>Delete Permanently</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                 <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-green-400 hover:text-green-300 hover:bg-green-500/10">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reactivate {student.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                   This will move the student back to the active list. Are you sure?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => reactivateStudent(student.uid)}>Reactivate</AlertDialogAction>
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

    const tab = searchParams.get('tab');
    
    const { user } = useAuth();
    const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
    const [users, setUsers] = useState<Student[]>([]);
    const [planChangeRequests, setPlanChangeRequests] = useState<PlanChangeRequest[]>([]);
    
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [isPlansLoading, setIsPlansLoading] = useState(true);
    const [isLeavesLoading, setIsLeavesLoading] = useState(true);

    const isLoading = isUsersLoading || isPlansLoading || isLeavesLoading;

    useEffect(() => {
        if (!user || !user.uid) {
            setIsUsersLoading(false);
            setIsPlansLoading(false);
            setIsLeavesLoading(false);
            return;
        }
        
        setIsUsersLoading(true);
        setIsPlansLoading(true);
        setIsLeavesLoading(true);

        const unsubscribeUsers = onUsersUpdate(user.uid, (data) => {
            setUsers(data);
            setIsUsersLoading(false);
        });

        const unsubscribePlans = onPlanChangeRequestsUpdate(user.uid, (data) => {
            setPlanChangeRequests(data);
            setIsPlansLoading(false);
        });
        
        const unsubscribeLeaves = onAllLeavesUpdate((data) => {
            setAllLeaves(data);
            setIsLeavesLoading(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribePlans();
            unsubscribeLeaves();
        };
    }, [user]);

    const { activeStudents, suspendedStudents, pendingStudents } = useMemo(() => {
        const active: Student[] = [];
        const suspended: Student[] = [];
        const pending: Student[] = [];
        
        users.forEach(student => {
            if (student.status === 'suspended') {
                suspended.push(student);
            } else if (student.status === 'pending_approval') {
                pending.push(student);
            } else if (student.status === 'active') {
                active.push(student);
            }
        });

        return { 
            activeStudents: active, 
            suspendedStudents: suspended, 
            pendingStudents: pending 
        };
    }, [users]);

    const filteredActiveStudents = useMemo(() => {
        return activeStudents
            .filter(student => {
                const dummyBill = getDummyBillForStudent(student);
                if (filterStatus === 'all') return true;
                return dummyBill.status === filterStatus;
            })
             .filter(student => {
                if (filterPlan === 'all') return true;
                return student.messPlan === filterPlan;
            })
            .filter(student => {
                if (!searchQuery) return true;
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = student.name.toLowerCase().includes(searchLower);
                const idMatch = student.studentId && student.studentId.toLowerCase().includes(searchLower);
                return nameMatch || idMatch;
            });
    }, [activeStudents, filterStatus, searchQuery, filterPlan]);
    
    const formatPlanName = (plan: string) => {
        return plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const tabsConfig = [
        { value: "joined", label: "Students", icon: Users, data: activeStudents, badgeVariant: 'secondary' as const },
        { value: "requests", label: "Requests", icon: UserPlus, data: pendingStudents, badgeVariant: pendingStudents.length > 0 ? 'destructive' : 'secondary' },
        { value: "plan_requests", label: "Plan", icon: GitCompareArrows, data: planChangeRequests, badgeVariant: planChangeRequests.length > 0 ? 'destructive' : 'secondary' },
        { value: "suspended", label: "Suspended", icon: ShieldX, data: suspendedStudents, badgeVariant: 'secondary' as const },
    ];

    const studentToView = openStudentId ? users.find(s => s.uid === openStudentId) : null;
    const leavesForStudent = studentToView ? allLeaves.filter(l => l.studentId === studentToView.uid) : [];

    return (
        <div>
            <Tabs defaultValue={tab || "joined"} className="w-full">
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
                            filteredActiveStudents.map((student) => (
                               <StudentRowCard 
                                    key={student.uid} 
                                    student={student} 
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

                 <TabsContent value="suspended" className="mt-4">
                    <div className="flex flex-col gap-3">
                         {isLoading ? (
                            Array.from({ length: 1 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
                        ) : suspendedStudents.length > 0 ? (
                            suspendedStudents.map((student) => (
                            <StudentRowCard 
                                    key={student.uid} 
                                    student={student} 
                                    showActions={false}
                                    onOpenDialog={() => handleOpenDialog(student.uid)}
                                />
                            ))
                         ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                <p>No suspended students.</p>
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


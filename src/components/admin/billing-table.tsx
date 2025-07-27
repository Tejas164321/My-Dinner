
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Student } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BillingTableProps {
    filterMonth: string;
    students: Student[];
    isLoading: boolean;
}

const getDummyBillForStudent = (student: Student) => {
    if (!student || !student.uid) return { due: 0 };
    const base = student.messPlan === 'full_day' ? 3500 : 1800;
    const due = student.uid.charCodeAt(0) % 2 === 0 ? base : 0;
    return { due };
};

const BillRow = ({ student, month }: { student: Student, month: string }) => {
    const bill = getDummyBillForStudent(student);
    if (bill.due <= 0) return null;

    return (
        <div className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors">
            <Avatar className="w-10 h-10 border">
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold text-sm md:text-base">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.studentId}</p>
            </div>
             <div className="text-right">
                <p className="font-medium text-destructive text-sm md:text-base">₹{bill.due.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Due</p>
            </div>
            <Button size="sm" variant="outline"><Bell className="h-4 w-4 md:mr-1.5" /> <span className="hidden md:inline">Remind</span></Button>
        </div>
    )
};

export function BillingTable({ filterMonth, students, isLoading }: BillingTableProps) {
    const dueStudents = useMemo(() => {
        return students.filter(student => {
            const bill = getDummyBillForStudent(student);
            return bill.due > 0;
        });
    }, [students, filterMonth]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Pending Payments</CardTitle>
                        <CardDescription>Students with outstanding dues for {filterMonth.charAt(0).toUpperCase() + filterMonth.slice(1)}.</CardDescription>
                    </div>
                    {dueStudents.length > 0 && (
                        <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4 mr-1.5" /> Remind All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0 relative">
                <ScrollArea className="h-[350px] absolute inset-0 p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : dueStudents.length > 0 ? (
                            dueStudents.map((student) => (
                               <BillRow key={student.uid} student={student} month={filterMonth} />
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground py-10">
                                <p>No pending payments for this month.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

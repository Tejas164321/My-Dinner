'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { studentsData, Student } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BillingTableProps {
    filterMonth: string;
}

const BillRow = ({ student, month }: { student: Student, month: string }) => {
    const monthDetails = student.monthlyDetails[month as keyof typeof student.monthlyDetails];
    if (!monthDetails || monthDetails.status !== 'Due') {
        return null;
    }
    const dueAmount = monthDetails.bill.total - monthDetails.bill.paid;

    return (
        <div className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors">
            <Avatar className="w-10 h-10 border">
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-muted-foreground">Due: <span className="font-medium text-destructive">₹{dueAmount.toLocaleString()}</span></p>
            </div>
            <Button size="sm" variant="outline"><Bell className="h-4 w-4 mr-1.5" /> Remind</Button>
        </div>
    )
};

export function BillingTable({ filterMonth }: BillingTableProps) {
    const dueStudents = useMemo(() => {
        return studentsData.filter(student => {
            const monthDetails = student.monthlyDetails[filterMonth as keyof typeof student.monthlyDetails];
            return monthDetails?.status === 'Due';
        });
    }, [filterMonth]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Pending Payments</CardTitle>
                        <CardDescription>Students with outstanding dues for {filterMonth.charAt(0).toUpperCase() + filterMonth.slice(1)}.</CardDescription>
                    </div>
                    {dueStudents.length > 0 && (
                        <Button>
                            <Bell className="h-4 w-4 mr-1.5" /> Remind All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0 relative">
                <ScrollArea className="h-[350px] absolute inset-0 p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        {dueStudents.length > 0 ? (
                            dueStudents.map((student) => (
                               <BillRow key={student.id} student={student} month={filterMonth} />
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

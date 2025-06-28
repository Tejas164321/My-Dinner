'use client';

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { studentsData, joinRequests, monthMap } from "@/lib/data";
import { Check, X, MoreVertical } from "lucide-react";
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
}

export function StudentsTable({ filterMonth, filterStatus }: StudentsTableProps) {

    const filteredStudents = useMemo(() => {
        return studentsData.filter(student => {
            if (filterStatus === 'all') {
                return true;
            }
            const monthDetails = student.monthlyDetails[filterMonth as keyof typeof student.monthlyDetails];
            return monthDetails?.status === filterStatus;
        });
    }, [filterMonth, filterStatus]);

    const initialDate = useMemo(() => monthMap[filterMonth], [filterMonth]);

    return (
        <Card>
            <CardContent className="pt-6">
                <Tabs defaultValue="joined" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="joined">All Students</TabsTrigger>
                        <TabsTrigger value="requests">Join Requests <Badge variant="secondary" className="ml-2">{joinRequests.length}</Badge></TabsTrigger>
                    </TabsList>
                    <TabsContent value="joined" className="mt-4">
                        <div className="flex flex-col gap-4">
                            {filteredStudents.map((student) => {
                                const monthDetails = student.monthlyDetails[filterMonth as keyof typeof student.monthlyDetails];
                                const billAmount = monthDetails.bill.total - monthDetails.bill.paid;
                                const billDisplay = billAmount > 0 ? `₹${billAmount.toLocaleString()}` : '₹0';
                                
                                return (
                                <Dialog key={student.id}>
                                    <DialogTrigger asChild>
                                        <Card className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 group animate-in fade-in-0">
                                            <CardContent className="p-3 flex items-center gap-4">
                                                <Avatar className="w-12 h-12 border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors">
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                                                    <div className="col-span-1">
                                                        <h3 className="font-semibold text-base">{student.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{student.studentId}</p>
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
                                                <MoreVertical className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-4"/>
                                            </CardContent>
                                        </Card>
                                    </DialogTrigger>
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
                            )})}
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
                </Tabs>
            </CardContent>
        </Card>
    );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { joinedStudents, joinRequests } from "@/lib/data";
import { Check, X, MoreVertical, Percent, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentDetailCard } from "./student-detail-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StudentsTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Roster</CardTitle>
                <CardDescription>Manage student profiles and view their details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="joined">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="requests">Join Requests <Badge variant="secondary" className="ml-2">{joinRequests.length}</Badge></TabsTrigger>
                        <TabsTrigger value="joined">All Students</TabsTrigger>
                    </TabsList>
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
                    <TabsContent value="joined" className="mt-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {joinedStudents.map((student) => (
                                <Dialog key={student.id}>
                                    <DialogTrigger asChild>
                                        <Card className="cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all duration-300 group overflow-hidden animate-in fade-in-0 zoom-in-95">
                                            <CardContent className="p-4 flex flex-col items-center text-center relative">
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-5 h-5 text-muted-foreground"/>
                                                </div>
                                                <Avatar className="w-20 h-20 mb-4 border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors">
                                                    <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="profile avatar"/>
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-semibold text-lg">{student.name}</h3>
                                                <p className="text-sm text-muted-foreground">{student.studentId}</p>
                                                <div className="mt-4 w-full flex justify-around items-center text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1" title="Attendance">
                                                        <Percent className="w-3 h-3"/>
                                                        <span>{student.attendance}</span>
                                                    </div>
                                                    <div title="Bill Status">
                                                        <Badge variant={student.status === 'Paid' ? 'secondary' : 'destructive'} className="px-1.5 py-0.5 text-[10px] font-bold">
                                                            {student.bill}
                                                        </Badge>
                                                    </div>
                                                     <div className="flex items-center gap-1" title="Join Date">
                                                        <CalendarDays className="w-3 h-3"/>
                                                        <span>{student.joinDate}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
                                        <StudentDetailCard student={student} />
                                    </DialogContent>
                                </Dialog>
                            ))}
                       </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
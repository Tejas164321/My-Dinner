'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { menu } from "@/lib/data";

const days = Object.keys(menu);

export function MenuSchedule() {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <CardTitle>Weekly Meal Menu</CardTitle>
                        <CardDescription>The scheduled menu for the current week.</CardDescription>
                    </div>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Menu
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Lunch</TableHead>
                                <TableHead>Dinner</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {days.map((day) => (
                                <TableRow key={day}>
                                    <TableCell className="font-medium capitalize">{day}</TableCell>
                                    <TableCell>{menu[day as keyof typeof menu].lunch}</TableCell>
                                    <TableCell>{menu[day as keyof typeof menu].dinner}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

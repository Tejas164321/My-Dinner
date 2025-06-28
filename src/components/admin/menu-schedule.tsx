'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X } from "lucide-react";
import { menu as initialMenu } from "@/lib/data";

const days = Object.keys(initialMenu) as (keyof typeof initialMenu)[];

// Create a deep copy to allow for state mutation during the user's session for demo purposes.
let menu = JSON.parse(JSON.stringify(initialMenu));

export function MenuSchedule() {
    const [isEditing, setIsEditing] = useState(false);
    const [editableMenu, setEditableMenu] = useState(menu);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Reset changes from the last saved state
        setEditableMenu(JSON.parse(JSON.stringify(menu))); 
        setIsEditing(false);
    };

    const handleSave = () => {
        // In a real app, you'd send this to a server.
        // For this demo, we'll update our in-memory `menu` object.
        menu = JSON.parse(JSON.stringify(editableMenu));
        setIsEditing(false);
    };

    const handleInputChange = (day: keyof typeof menu, meal: 'lunch' | 'dinner', value: string) => {
        setEditableMenu((prevMenu: typeof menu) => ({
            ...prevMenu,
            [day]: {
                ...prevMenu[day],
                [meal]: value,
            },
        }));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <CardTitle>Weekly Meal Menu</CardTitle>
                        <CardDescription>
                            {isEditing ? "Update the meal details below." : "The scheduled menu for the current week."}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={handleEdit}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Menu
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Day</TableHead>
                                <TableHead>Lunch</TableHead>
                                <TableHead>Dinner</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {days.map((day) => (
                                <TableRow key={day}>
                                    <TableCell className="font-medium capitalize">{day}</TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editableMenu[day].lunch}
                                                onChange={(e) => handleInputChange(day, 'lunch', e.target.value)}
                                                className="h-9"
                                            />
                                        ) : (
                                            editableMenu[day].lunch
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editableMenu[day].dinner}
                                                onChange={(e) => handleInputChange(day, 'dinner', e.target.value)}
                                                className="h-9"
                                            />
                                        ) : (
                                            editableMenu[day].dinner
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

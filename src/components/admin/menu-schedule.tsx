'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, History, Clock, X } from "lucide-react";
import { commonMenuItems, menuHistory } from "@/lib/data";
import { format, subDays } from 'date-fns';

const today = new Date();
const pastSevenDaysMenu = menuHistory.map((menu, i) => {
    const date = subDays(today, i + 1);
    return {
        ...menu,
        date: date,
        day: format(date, 'EEEE'),
    };
});


export function MenuSchedule() {
    const [isEditingLunch, setIsEditingLunch] = useState(false);
    const [isEditingDinner, setIsEditingDinner] = useState(false);
    
    const [lunchMenu, setLunchMenu] = useState("Rajma Chawal, Salad");
    const [dinnerMenu, setDinnerMenu] = useState("Chole Bhature");

    const [tempLunchMenu, setTempLunchMenu] = useState(lunchMenu);
    const [tempDinnerMenu, setTempDinnerMenu] = useState(dinnerMenu);

    const handleEditLunch = () => {
        setTempLunchMenu(lunchMenu);
        setIsEditingLunch(true);
    };

    const handleSaveLunch = () => {
        setLunchMenu(tempLunchMenu);
        setIsEditingLunch(false);
    };

    const handleCancelLunch = () => {
        setIsEditingLunch(false);
    };

    const handleEditDinner = () => {
        setTempDinnerMenu(dinnerMenu);
        setIsEditingDinner(true);
    };

    const handleSaveDinner = () => {
        setDinnerMenu(tempDinnerMenu);
        setIsEditingDinner(false);
    };

    const handleCancelDinner = () => {
        setIsEditingDinner(false);
    };

    const handleQuickAdd = (meal: 'lunch' | 'dinner', item: string) => {
        if (meal === 'lunch') {
            setTempLunchMenu(prev => prev ? `${prev}, ${item}` : item);
        } else {
            setTempDinnerMenu(prev => prev ? `${prev}, ${item}` : item);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-primary"/>
                        <div>
                            <CardTitle>Set Today's Menu</CardTitle>
                            <CardDescription>Update the menu for today's meals. Changes will be live immediately.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {/* Lunch Editor */}
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Lunch Menu</h3>
                            {isEditingLunch ? (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={handleCancelLunch}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                    <Button size="sm" onClick={handleSaveLunch}><Save className="h-4 w-4 mr-1" /> Save</Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={handleEditLunch}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                            )}
                        </div>
                        <Textarea 
                            value={isEditingLunch ? tempLunchMenu : lunchMenu}
                            onChange={(e) => setTempLunchMenu(e.target.value)}
                            disabled={!isEditingLunch}
                            rows={3}
                            placeholder="e.g., Aloo Gobi, Roti, Dal"
                        />
                        {isEditingLunch && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Quick Add:</p>
                                <div className="flex flex-wrap gap-2">
                                    {commonMenuItems.map(item => (
                                        <Button key={item} variant="outline" size="sm" onClick={() => handleQuickAdd('lunch', item)}>{item}</Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dinner Editor */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Dinner Menu</h3>
                             {isEditingDinner ? (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={handleCancelDinner}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                    <Button size="sm" onClick={handleSaveDinner}><Save className="h-4 w-4 mr-1" /> Save</Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={handleEditDinner}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                            )}
                        </div>
                        <Textarea 
                             value={isEditingDinner ? tempDinnerMenu : dinnerMenu}
                             onChange={(e) => setTempDinnerMenu(e.target.value)}
                             disabled={!isEditingDinner}
                             rows={3}
                             placeholder="e.g., Paneer Butter Masala, Rice"
                        />
                         {isEditingDinner && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Quick Add:</p>
                                <div className="flex flex-wrap gap-2">
                                    {commonMenuItems.map(item => (
                                        <Button key={item} variant="outline" size="sm" onClick={() => handleQuickAdd('dinner', item)}>{item}</Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <History className="h-6 w-6 text-primary"/>
                        <div>
                            <CardTitle>Menu History</CardTitle>
                            <CardDescription>Menu from the last 7 days to help avoid repetition.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Lunch</TableHead>
                                    <TableHead>Dinner</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastSevenDaysMenu.map((item, index) => (
                                    <TableRow key={index} className="text-muted-foreground">
                                        <TableCell className="font-medium">{item.day}</TableCell>
                                        <TableCell>{format(item.date, 'MMM do')}</TableCell>
                                        <TableCell>{item.lunch}</TableCell>
                                        <TableCell>{item.dinner}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
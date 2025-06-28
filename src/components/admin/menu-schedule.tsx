
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Pencil, Save, History, Plus, X, Calendar as CalendarIcon, Utensils } from "lucide-react";
import { commonMenuItems, dailyMenus, DailyMenu } from "@/lib/data";
import { format, subDays, startOfDay } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export function MenuSchedule() {
    const [menus, setMenus] = useState(dailyMenus);
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
    const [isEditing, setIsEditing] = useState<false | 'lunch' | 'dinner'>(false);

    const [lunchItems, setLunchItems] = useState<string[]>([]);
    const [dinnerItems, setDinnerItems] = useState<string[]>([]);
    
    const [tempLunchItems, setTempLunchItems] = useState<string[]>([]);
    const [tempDinnerItems, setTempDinnerItems] = useState<string[]>([]);

    const [newLunchItem, setNewLunchItem] = useState('');
    const [newDinnerItem, setNewDinnerItem] = useState('');

    useEffect(() => {
        const dateKey = formatDateKey(selectedDate);
        const menuForDay = menus.get(dateKey) || { lunch: [], dinner: [] };
        setLunchItems(menuForDay.lunch);
        setDinnerItems(menuForDay.dinner);
        setIsEditing(false); 
    }, [selectedDate, menus]);
    
    const menuHistory = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(selectedDate, i + 1);
            const dateKey = formatDateKey(date);
            const menu = menus.get(dateKey);
            return {
                date: date,
                day: format(date, 'EEEE'),
                lunch: menu?.lunch.join(', ') || 'Not Set',
                dinner: menu?.dinner.join(', ') || 'Not Set',
            };
        });
    }, [selectedDate, menus]);

    const handleEdit = (meal: 'lunch' | 'dinner') => {
        setTempLunchItems([...lunchItems]);
        setTempDinnerItems([...dinnerItems]);
        setIsEditing(meal);
    };

    const handleSave = () => {
        const dateKey = formatDateKey(selectedDate);
        const newMenus = new Map(menus);
        newMenus.set(dateKey, { lunch: tempLunchItems, dinner: tempDinnerItems });
        setMenus(newMenus);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleAddItem = (meal: 'lunch' | 'dinner') => {
        if (meal === 'lunch' && newLunchItem.trim()) {
            setTempLunchItems(prev => [...prev, newLunchItem.trim()]);
            setNewLunchItem('');
        } else if (meal === 'dinner' && newDinnerItem.trim()) {
            setTempDinnerItems(prev => [...prev, newDinnerItem.trim()]);
            setNewDinnerItem('');
        }
    };
    
    const handleRemoveItem = (meal: 'lunch' | 'dinner', index: number) => {
        if (meal === 'lunch') {
            setTempLunchItems(prev => prev.filter((_, i) => i !== index));
        } else {
            setTempDinnerItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleQuickAdd = (meal: 'lunch' | 'dinner', item: string) => {
        if (meal === 'lunch') {
            setTempLunchItems(prev => [...prev, item]);
        } else {
            setTempDinnerItems(prev => [...prev, item]);
        }
    };
    
    const renderMenuTags = (items: string[], meal: 'lunch' | 'dinner') => (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-background/50 p-3 min-h-[80px]">
            {items.map((item, index) => (
                <Badge key={`${meal}-${index}`} variant="secondary" className="text-base py-1 px-3 flex items-center gap-2">
                    {item}
                    {isEditing === meal && (
                        <button onClick={() => handleRemoveItem(meal, index)} className="rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </Badge>
            ))}
            {items.length === 0 && <span className="text-sm text-muted-foreground p-2">No items set.</span>}
        </div>
    );
    
    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                            <Utensils className="h-6 w-6 text-primary"/>
                            <div>
                                <CardTitle>Set Meal Menu</CardTitle>
                                <CardDescription>Select a date and set the menu for lunch and dinner.</CardDescription>
                            </div>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[280px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Lunch Editor */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Lunch Menu</h3>
                            {isEditing ? (
                                isEditing === 'lunch' && <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button><Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save All</Button></div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('lunch')}><Pencil className="h-4 w-4 mr-1" /> Edit Lunch</Button>
                            )}
                        </div>
                        {renderMenuTags(isEditing === 'lunch' ? tempLunchItems : lunchItems, 'lunch')}
                        {isEditing === 'lunch' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add new item..." 
                                        value={newLunchItem}
                                        onChange={e => setNewLunchItem(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddItem('lunch')}
                                    />
                                    <Button onClick={() => handleAddItem('lunch')}><Plus className="h-4 w-4 mr-1"/> Add</Button>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Quick Add:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {commonMenuItems.map(item => (
                                            <Button key={item} variant="outline" size="sm" onClick={() => handleQuickAdd('lunch', item)}>{item}</Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dinner Editor */}
                        <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Dinner Menu</h3>
                            {isEditing ? (
                                isEditing === 'dinner' && <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button><Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save All</Button></div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('dinner')}><Pencil className="h-4 w-4 mr-1" /> Edit Dinner</Button>
                            )}
                        </div>
                        {renderMenuTags(isEditing === 'dinner' ? tempDinnerItems : dinnerItems, 'dinner')}
                        {isEditing === 'dinner' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add new item..." 
                                        value={newDinnerItem}
                                        onChange={e => setNewDinnerItem(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddItem('dinner')}
                                    />
                                    <Button onClick={() => handleAddItem('dinner')}><Plus className="h-4 w-4 mr-1"/> Add</Button>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Quick Add:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {commonMenuItems.map(item => (
                                            <Button key={item} variant="outline" size="sm" onClick={() => handleQuickAdd('dinner', item)}>{item}</Button>
                                        ))}
                                    </div>
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
                            <CardDescription>Previous 7 days from selected date.</CardDescription>
                        </div>
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
                                {menuHistory.map((item, index) => (
                                    <TableRow key={index} className="text-muted-foreground">
                                        <TableCell className="font-medium text-foreground">{format(item.date, 'EEE, MMM do')}</TableCell>
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

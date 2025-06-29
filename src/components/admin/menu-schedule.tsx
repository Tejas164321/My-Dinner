
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Pencil, Save, History, Plus, X, Calendar as CalendarIcon, Utensils, Sparkles, Loader2 } from "lucide-react";
import { commonMenuItems, dailyMenus, DailyMenu } from "@/lib/data";
import { format, subDays, startOfDay } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getMenuSuggestions } from '@/ai/flows/menu-suggestion-flow';
import { useToast } from "@/hooks/use-toast";

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export function MenuSchedule() {
    const { toast } = useToast();
    const [menus, setMenus] = useState(dailyMenus);
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
    const [isEditing, setIsEditing] = useState<false | 'lunch' | 'dinner'>(false);

    const [lunchItems, setLunchItems] = useState<string[]>([]);
    const [dinnerItems, setDinnerItems] = useState<string[]>([]);
    
    const [tempLunchItems, setTempLunchItems] = useState<string[]>([]);
    const [tempDinnerItems, setTempDinnerItems] = useState<string[]>([]);

    const [newLunchItem, setNewLunchItem] = useState('');
    const [newDinnerItem, setNewDinnerItem] = useState('');

    const [isSuggesting, setIsSuggesting] = useState<false | 'lunch' | 'dinner'>(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        const dateKey = formatDateKey(selectedDate);
        const menuForDay = menus.get(dateKey) || { lunch: [], dinner: [] };
        setLunchItems(menuForDay.lunch);
        setDinnerItems(menuForDay.dinner);
        setIsEditing(false); 
        setSuggestions([]);
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
        if (meal === 'lunch') {
            setTempLunchItems([...lunchItems]);
        } else {
            setTempDinnerItems([...dinnerItems]);
        }
        setIsEditing(meal);
    };

    const handleSave = () => {
        const dateKey = formatDateKey(selectedDate);
        const newMenus = new Map(menus);
        newMenus.set(dateKey, { 
            lunch: tempLunchItems, 
            dinner: tempDinnerItems
        });
        setMenus(newMenus);
        setIsEditing(false);
        setSuggestions([]);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSuggestions([]);
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
        setSuggestions(prev => prev.filter(s => s !== item));
    };

    const handleGetSuggestions = async (meal: 'lunch' | 'dinner') => {
        setIsSuggesting(meal);
        setSuggestions([]);
        try {
            const existingItems = meal === 'lunch' ? tempLunchItems : tempDinnerItems;
            const result = await getMenuSuggestions({ mealType: meal, existingItems });
            if (result.suggestions && result.suggestions.length > 0) {
                setSuggestions(result.suggestions);
            } else {
                 toast({
                    variant: "destructive",
                    title: "No Suggestions",
                    description: "The AI couldn't generate suggestions at this time.",
                });
            }
        } catch (error) {
            console.error("Error getting AI suggestions:", error);
            toast({
                variant: "destructive",
                title: "AI Error",
                description: "Failed to get suggestions from the AI.",
            });
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const renderMenuTags = (items: string[], meal: 'lunch' | 'dinner') => (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-background/50 p-3 min-h-[120px]">
            {items.map((item, index) => (
                <Badge key={`${meal}-${index}`} variant="secondary" className="text-sm py-1 px-2 flex items-center gap-1.5">
                    {item}
                    {isEditing === meal && (
                        <button onClick={() => handleRemoveItem(meal, index)} className="rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </Badge>
            ))}
            {items.length === 0 && <span className="text-sm text-muted-foreground p-2">No items set.</span>}
        </div>
    );
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Utensils className="h-6 w-6 text-primary"/>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Set Meal Menu</h2>
                        <p className="text-muted-foreground">Select a date to view or edit its menu.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Lunch Card */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Lunch Menu</CardTitle>
                             {isEditing && isEditing !== 'lunch' ? null : (
                                isEditing === 'lunch' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                                        <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save All</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleEdit('lunch')}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                )
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {renderMenuTags(isEditing === 'lunch' ? tempLunchItems : lunchItems, 'lunch')}
                        {isEditing === 'lunch' && (
                             <div className="space-y-4">
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
                                </div>
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full" onClick={() => handleGetSuggestions('lunch')} disabled={isSuggesting === 'lunch'}>
                                        {isSuggesting === 'lunch' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />}
                                        Suggest with AI
                                    </Button>
                                    {suggestions.length > 0 && isEditing === 'lunch' && (
                                        <div className="p-3 bg-secondary/50 rounded-lg space-y-2 animate-in fade-in-0">
                                             <p className="text-sm text-muted-foreground">AI Suggestions:</p>
                                             <div className="flex flex-wrap gap-2">
                                                {suggestions.map(item => (
                                                    <Button key={item} variant="outline" size="sm" onClick={() => handleQuickAdd('lunch', item)}>{item}</Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dinner Card */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Dinner Menu</CardTitle>
                             {isEditing && isEditing !== 'dinner' ? null : (
                                !isEditing ? (
                                    <Button size="sm" variant="outline" onClick={() => handleEdit('dinner')}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                ) : null
                             )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {renderMenuTags(isEditing === 'dinner' ? tempDinnerItems : dinnerItems, 'dinner')}
                         {isEditing === 'dinner' && (
                             <div className="space-y-4">
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
                                </div>
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full" onClick={() => handleGetSuggestions('dinner')} disabled={isSuggesting === 'dinner'}>
                                        {isSuggesting === 'dinner' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />}
                                        Suggest with AI
                                    </Button>
                                    {suggestions.length > 0 && isEditing === 'dinner' && (
                                        <div className="p-3 bg-secondary/50 rounded-lg space-y-2 animate-in fade-in-0">
                                             <p className="text-sm text-muted-foreground">AI Suggestions:</p>
                                             <div className="flex flex-wrap gap-2">
                                                {suggestions.map(item => (
                                                    <Button key={item} variant="outline" size="sm" onClick={() => handleQuickAdd('dinner', item)}>{item}</Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

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

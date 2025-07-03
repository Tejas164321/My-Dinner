'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Pencil, Save, History, Plus, X, Calendar as CalendarIcon, Utensils, Loader2 } from "lucide-react";
import { getMenuForDate, saveMenuForDate } from '@/lib/actions/menu';
import { commonMenuItems } from "@/lib/data";
import { format, startOfDay, subDays } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import type { DailyMenu } from '@/lib/actions/menu';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export function MenuSchedule() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isEditing, setIsEditing] = useState<false | 'lunch' | 'dinner'>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [lunchItems, setLunchItems] = useState<string[]>([]);
    const [dinnerItems, setDinnerItems] = useState<string[]>([]);
    
    const [tempLunchItems, setTempLunchItems] = useState<string[]>([]);
    const [tempDinnerItems, setTempDinnerItems] = useState<string[]>([]);

    const [newLunchItem, setNewLunchItem] = useState('');
    const [newDinnerItem, setNewDinnerItem] = useState('');
    
    const [history, setHistory] = useState<{ date: string; menu: DailyMenu }[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useEffect(() => {
        setSelectedDate(startOfDay(new Date()));
        
        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            const today = startOfDay(new Date());
            const pastDates = [
                subDays(today, 1),
                subDays(today, 2),
                subDays(today, 3),
            ];
            const historyPromises = pastDates.map(async (date) => {
                const dateKey = formatDateKey(date);
                const menu = await getMenuForDate(dateKey);
                if (menu && (menu.lunch.length > 0 || menu.dinner.length > 0)) {
                   return { date: format(date, 'PPP'), menu };
                }
                return null;
            });
            const resolvedHistory = (await Promise.all(historyPromises)).filter(Boolean) as { date: string; menu: DailyMenu }[];
            setHistory(resolvedHistory);
            setIsHistoryLoading(false);
        };

        fetchHistory();
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        
        const fetchMenu = async () => {
            setIsLoading(true);
            const dateKey = formatDateKey(selectedDate);
            const menuForDay = await getMenuForDate(dateKey);
            
            const lunch = menuForDay?.lunch || [];
            const dinner = menuForDay?.dinner || [];

            setLunchItems(lunch);
            setDinnerItems(dinner);
            setTempLunchItems(lunch);
            setTempDinnerItems(dinner);
            setIsEditing(false); 
            setIsLoading(false);
        };

        fetchMenu();
    }, [selectedDate]);
    
    const handleEdit = (meal: 'lunch' | 'dinner') => {
        setTempLunchItems([...lunchItems]);
        setTempDinnerItems([...dinnerItems]);
        setIsEditing(meal);
    };

    const handleSave = async () => {
        if (!selectedDate || isSaving) return;

        setIsSaving(true);
        const dateKey = formatDateKey(selectedDate);
        
        let menuData: DailyMenu;

        if (isEditing === 'lunch') {
            menuData = { lunch: tempLunchItems, dinner: dinnerItems };
        } else if (isEditing === 'dinner') {
            menuData = { lunch: lunchItems, dinner: tempDinnerItems };
        } else {
            setIsSaving(false);
            return;
        }
        
        try {
            await saveMenuForDate(dateKey, menuData);
            
            setLunchItems(menuData.lunch);
            setDinnerItems(menuData.dinner);
            setIsEditing(false);

            toast({
                title: "Menu Saved!",
                description: `The menu for ${format(selectedDate, 'PPP')} has been updated.`,
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Save Failed",
                description: "There was an error saving the menu. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
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
    
    const handleAddCommonItem = (meal: 'lunch' | 'dinner', item: string) => {
        if (meal === 'lunch') {
            if (!tempLunchItems.includes(item)) {
                setTempLunchItems(prev => [...prev, item]);
            }
        } else {
             if (!tempDinnerItems.includes(item)) {
                setTempDinnerItems(prev => [...prev, item]);
            }
        }
    };

    const renderMenuTags = (items: string[], meal: 'lunch' | 'dinner') => (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-background/50 p-3 min-h-[120px]">
             {isLoading ? (
                <div className="w-full space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
            ) : (
                <>
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
                    {items.length === 0 && <span className="text-sm text-muted-foreground p-2">No items set. Click 'Edit' to add.</span>}
                </>
            )}
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
                                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
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
                             <div className="space-y-4 pt-2">
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
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Common Items</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {commonMenuItems.map(item => (
                                                <Badge 
                                                    key={item} 
                                                    variant="outline" 
                                                    onClick={() => handleAddCommonItem('lunch', item)}
                                                    className="cursor-pointer hover:bg-secondary py-1"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> {item}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
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
                                isEditing === 'dinner' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                             {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleEdit('dinner')}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                )
                             )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {renderMenuTags(isEditing === 'dinner' ? tempDinnerItems : dinnerItems, 'dinner')}
                         {isEditing === 'dinner' && (
                             <div className="space-y-4 pt-2">
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
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Common Items</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {commonMenuItems.map(item => (
                                                <Badge 
                                                    key={item} 
                                                    variant="outline" 
                                                    onClick={() => handleAddCommonItem('dinner', item)}
                                                    className="cursor-pointer hover:bg-secondary py-1"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> {item}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" /> Menu History
                    </CardTitle>
                    <CardDescription>Recently set menus from the past 3 days.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isHistoryLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : history.length > 0 ? (
                        history.map(item => (
                            <div key={item.date} className="rounded-lg border p-4 bg-secondary/30">
                                <h4 className="font-semibold">{item.date}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                                    <div>
                                        <p className="font-medium text-muted-foreground">Lunch</p>
                                        <p>{item.menu.lunch.join(', ') || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-muted-foreground">Dinner</p>
                                        <p>{item.menu.dinner.join(', ') || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent menu history found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

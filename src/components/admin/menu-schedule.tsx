
'use client';

import { useState, useEffect, Fragment } from 'react';
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
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

type MealType = 'lunch' | 'dinner';

export function MenuSchedule() {
    const { user: adminUser } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isEditing, setIsEditing] = useState<false | MealType>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [menu, setMenu] = useState<{ lunch: string[], dinner: string[] }>({ lunch: [], dinner: [] });
    const [tempMenu, setTempMenu] = useState<{ lunch: string[], dinner: string[] }>({ lunch: [], dinner: [] });
    const [newItem, setNewItem] = useState('');
    
    const [history, setHistory] = useState<{ date: string; menu: Omit<DailyMenu, 'messId'> }[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useEffect(() => {
        setSelectedDate(startOfDay(new Date()));
        
        if (!adminUser) {
            setIsHistoryLoading(false);
            return;
        }

        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            const today = startOfDay(new Date());
            const pastDates = [ subDays(today, 1), subDays(today, 2), subDays(today, 3) ];
            const historyPromises = pastDates.map(async (date) => {
                const dateKey = formatDateKey(date);
                const menuData = await getMenuForDate(adminUser.uid, dateKey);
                if (menuData && (menuData.lunch.length > 0 || menuData.dinner.length > 0)) {
                   return { date: format(date, 'PPP'), menu: menuData };
                }
                return null;
            });
            const resolvedHistory = (await Promise.all(historyPromises)).filter(Boolean) as { date: string; menu: DailyMenu }[];
            setHistory(resolvedHistory);
            setIsHistoryLoading(false);
        };

        fetchHistory();
    }, [adminUser]);

    useEffect(() => {
        if (!selectedDate || !adminUser) return;
        
        const fetchMenu = async () => {
            setIsLoading(true);
            const dateKey = formatDateKey(selectedDate);
            const menuForDay = await getMenuForDate(adminUser.uid, dateKey);
            
            const fetchedMenu = {
                lunch: menuForDay?.lunch || [],
                dinner: menuForDay?.dinner || []
            };

            setMenu(fetchedMenu);
            setTempMenu(fetchedMenu);
            setIsEditing(false); 
            setIsLoading(false);
        };

        fetchMenu();
    }, [selectedDate, adminUser]);
    
    const handleEdit = (meal: MealType) => {
        setTempMenu({ ...menu });
        setIsEditing(meal);
    };

    const handleSave = async () => {
        if (!selectedDate || isSaving || !adminUser || !isEditing) return;

        setIsSaving(true);
        const dateKey = formatDateKey(selectedDate);
        
        const menuData: Omit<DailyMenu, 'messId'> = {
            lunch: isEditing === 'lunch' ? tempMenu.lunch : menu.lunch,
            dinner: isEditing === 'dinner' ? tempMenu.dinner : menu.dinner,
        };
        
        try {
            await saveMenuForDate(adminUser.uid, dateKey, menuData);
            
            setMenu(menuData);
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
        setNewItem('');
    };

    const handleAddItem = (meal: MealType) => {
        if (!isEditing || !newItem.trim()) return;
        setTempMenu(prev => ({
            ...prev,
            [meal]: [...prev[meal], newItem.trim()]
        }));
        setNewItem('');
    };
    
    const handleRemoveItem = (meal: MealType, index: number) => {
        if (!isEditing) return;
        setTempMenu(prev => ({
            ...prev,
            [meal]: prev[meal].filter((_, i) => i !== index)
        }));
    };
    
    const handleAddCommonItem = (meal: MealType, item: string) => {
        if (!isEditing) return;
        setTempMenu(prev => {
            if (!prev[meal].includes(item)) {
                return { ...prev, [meal]: [...prev[meal], item] };
            }
            return prev;
        });
    };

    const renderMenuTags = (items: string[], meal: MealType) => (
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

    const renderEditControls = (meal: MealType) => (
        <div className="space-y-4 pt-2">
            <div className="space-y-3">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Add new item..." 
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem(meal)}
                    />
                    <Button onClick={() => handleAddItem(meal)}><Plus className="h-4 w-4 mr-1"/> Add</Button>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Common Items</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {commonMenuItems.map(item => (
                            <Badge 
                                key={item} 
                                variant="outline" 
                                onClick={() => handleAddCommonItem(meal, item)}
                                className="cursor-pointer hover:bg-secondary py-1"
                            >
                                <Plus className="h-3 w-3 mr-1" /> {item}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderMealCardContent = (meal: MealType) => {
        const currentItems = isEditing === meal ? tempMenu[meal] : menu[meal];
        return (
            <div className="flex-grow space-y-4">
                {renderMenuTags(currentItems, meal)}
                {isEditing === meal && renderEditControls(meal)}
            </div>
        );
    };

    const renderCardHeader = (meal: MealType) => (
         <div className="flex justify-between items-center">
            <CardTitle>{meal === 'lunch' ? 'Lunch Menu' : 'Dinner Menu'}</CardTitle>
            <div className={cn("flex", isEditing && isEditing !== meal && "hidden")}>
                {isEditing === meal ? (
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(meal)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                )}
            </div>
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
                        className={cn("w-full sm:w-[280px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
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

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="flex flex-col h-full">
                    <CardHeader>{renderCardHeader('lunch')}</CardHeader>
                    <CardContent className="flex-grow flex flex-col">{renderMealCardContent('lunch')}</CardContent>
                </Card>
                <Card className="flex flex-col h-full">
                    <CardHeader>{renderCardHeader('dinner')}</CardHeader>
                    <CardContent className="flex-grow flex flex-col">{renderMealCardContent('dinner')}</CardContent>
                </Card>
            </div>
            
            {/* Mobile: Tabs Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="lunch" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="lunch">Lunch</TabsTrigger>
                        <TabsTrigger value="dinner">Dinner</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lunch">
                        <Card>
                            <CardHeader>{renderCardHeader('lunch')}</CardHeader>
                            <CardContent>{renderMealCardContent('lunch')}</CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="dinner">
                        <Card>
                            <CardHeader>{renderCardHeader('dinner')}</CardHeader>
                            <CardContent>{renderMealCardContent('dinner')}</CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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

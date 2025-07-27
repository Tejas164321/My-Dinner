'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChefHat, Sun, Moon, Loader2 } from 'lucide-react';
import { activateStudentPlan } from '@/lib/actions/start-mess';

export default function StartMessPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [startDate, setStartDate] = useState<Date | undefined>(startOfDay(new Date()));
    const [startMeal, setStartMeal] = useState<'lunch' | 'dinner'>('lunch');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user || !startDate) {
            toast({ variant: 'destructive', title: 'Error', description: 'User data or start date is missing.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await activateStudentPlan({
                studentUid: user.uid,
                startDate,
                startMeal,
            });

            toast({
                title: 'Plan Activated!',
                description: `Your mess plan is all set to start on ${format(startDate, 'PPP')}.`,
            });
            router.push('/student/dashboard');

        } catch (error) {
            console.error("Error activating plan:", error);
            toast({ variant: 'destructive', title: 'Activation Failed', description: 'Could not set your start date. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
            <Card className="w-full max-w-lg z-10 animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 rounded-full border border-primary/20 bg-primary/10 p-3 shadow-lg">
                        <ChefHat className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Welcome to {user?.messName || 'the Mess'}!</CardTitle>
                    <CardDescription>Your join request has been approved. Select when you'd like your meal plan to begin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                            <Label className="text-center block">1. Choose your start date</Label>
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                disabled={(date) => date < startOfDay(new Date())}
                                className="rounded-md border flex justify-center"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-center block">2. Start with</Label>
                             <RadioGroup value={startMeal} onValueChange={(value: 'lunch' | 'dinner') => setStartMeal(value)} className="grid grid-cols-1 gap-4">
                                <Label htmlFor="r_lunch" className="flex items-center gap-4 rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                    <RadioGroupItem value="lunch" id="r_lunch" />
                                    <Sun className="h-6 w-6 text-yellow-400" />
                                    <span className="font-semibold">Lunch</span>
                                </Label>
                                <Label htmlFor="r_dinner" className="flex items-center gap-4 rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                    <RadioGroupItem value="dinner" id="r_dinner" />
                                    <Moon className="h-6 w-6 text-purple-400" />
                                    <span className="font-semibold">Dinner</span>
                                </Label>
                            </RadioGroup>
                        </div>
                    </div>
                     <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? 'Confirming...' : 'Confirm Start Date'}
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}

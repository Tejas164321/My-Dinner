
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, isSameDay, getHours } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChefHat, Sun, Moon, Loader2, CheckCircle, Info } from 'lucide-react';
import { activateStudentPlan } from '@/lib/actions/start-mess';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

const LUNCH_DEADLINE_HOUR = 10; // 10 AM
const DINNER_DEADLINE_HOUR = 18; // 6 PM

export default function StartMessPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [startDate, setStartDate] = useState<Date | undefined>(startOfDay(new Date()));
    const [startMeal, setStartMeal] = useState<'lunch' | 'dinner' | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Check deadlines
    const now = new Date();
    const currentHour = getHours(now);
    const isTodaySelected = startDate ? isSameDay(startDate, now) : false;
    
    const isLunchDisabled = isTodaySelected && currentHour >= LUNCH_DEADLINE_HOUR;
    const isDinnerDisabled = isTodaySelected && currentHour >= DINNER_DEADLINE_HOUR;

    // Effect to auto-select available meal or clear selection
    useEffect(() => {
        if (isLunchDisabled && isDinnerDisabled) {
             setStartMeal(undefined);
        } else if (isLunchDisabled && startMeal === 'lunch') {
            setStartMeal('dinner'); // Default to dinner if lunch is gone
        } else if (isDinnerDisabled && startMeal === 'dinner') {
             setStartMeal(undefined); // No meals available for today
        } else if (!startMeal && !isLunchDisabled) {
            setStartMeal('lunch'); // Default to lunch if available
        }
    }, [isLunchDisabled, isDinnerDisabled, startMeal]);
    

    const handleSubmit = async () => {
        if (!user || !startDate || !startMeal) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a valid start date and meal.' });
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
            <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <div className="glow-effect-1"></div>
            <div className="glow-effect-2"></div>
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
                            <Label className="text-center block font-semibold">1. Choose your start date</Label>
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                disabled={(date) => date < startOfDay(new Date())}
                                className="rounded-md border flex justify-center"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-center block font-semibold">2. Start with</Label>
                             <RadioGroup value={startMeal} onValueChange={(value) => setStartMeal(value as 'lunch' | 'dinner')} className="grid grid-cols-1 gap-4">
                                <Label htmlFor="r_lunch" className={cn("flex items-center gap-4 rounded-md border-2 p-4 font-normal transition-all", isLunchDisabled ? "cursor-not-allowed bg-muted/50 border-muted" : "cursor-pointer border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary")}>
                                    <RadioGroupItem value="lunch" id="r_lunch" disabled={isLunchDisabled} />
                                    <Sun className={cn("h-6 w-6", isLunchDisabled ? "text-muted-foreground" : "text-yellow-400")} />
                                    <span className={cn("font-semibold", isLunchDisabled && "text-muted-foreground")}>Lunch</span>
                                </Label>
                                <Label htmlFor="r_dinner" className={cn("flex items-center gap-4 rounded-md border-2 p-4 font-normal transition-all", isDinnerDisabled ? "cursor-not-allowed bg-muted/50 border-muted" : "cursor-pointer border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary")}>
                                    <RadioGroupItem value="dinner" id="r_dinner" disabled={isDinnerDisabled} />
                                    <Moon className={cn("h-6 w-6", isDinnerDisabled ? "text-muted-foreground" : "text-purple-400")} />
                                    <span className={cn("font-semibold", isDinnerDisabled && "text-muted-foreground")}>Dinner</span>
                                </Label>
                            </RadioGroup>
                            {isDinnerDisabled && isTodaySelected && (
                                <p className="text-center text-xs text-destructive">All meal deadlines for today have passed. Please select tomorrow to start.</p>
                            )}
                        </div>
                    </div>
                    {startDate && startMeal ? (
                        <Alert className="border-primary/30 bg-primary/10">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Your Plan Starts:</AlertTitle>
                            <AlertDescription>
                                {format(startDate, 'PPP')} with <span className="capitalize font-medium">{startMeal}</span>
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <Alert variant="destructive">
                            <Info className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Selection Required</AlertTitle>
                            <AlertDescription>
                                Please select a valid start date and meal.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                     <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || !startDate || !startMeal}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? 'Confirming...' : 'Confirm & Activate Plan'}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}



'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { paymentReminders, Holiday, Leave, AppUser, BillDetails } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { cn } from '@/lib/utils';
import { Receipt, Wallet, CreditCard, Banknote, X, Info, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BillDetailDialog } from '@/components/student/bill-detail-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format, getMonth, getYear, getDaysInMonth, isSameDay, startOfMonth, subMonths } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const CHARGE_PER_MEAL = 65;

export interface Bill {
    id: string;
    month: string;
    year: number;
    generationDate: string;
    totalAmount: number;
    payments: { amount: number; date: string }[];
    status: 'Paid' | 'Due';
    details: BillDetails;
}

const getPaidAmount = (bill: Bill) => bill.payments.reduce((sum, p) => sum + p.amount, 0);

const calculateBillDetailsForMonth = (
    monthDate: Date, 
    user: AppUser, 
    allHolidays: Holiday[], 
    allLeaves: Leave[]
): BillDetails => {
    const month = getMonth(monthDate);
    const year = getYear(monthDate);
    const daysInMonth = getDaysInMonth(monthDate);
    
    const holidays = allHolidays.filter(h => getMonth(h.date) === month && getYear(h.date) === year);
    const leaves = allLeaves.filter(l => getMonth(l.date) === month && getYear(l.date) === year);

    let totalMeals = 0;
    let fullDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let holidayCount = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        const holiday = holidays.find(h => isSameDay(h.date, day));
        const leave = leaves.find(l => isSameDay(l.date, day));

        if (holiday) {
            holidayCount++;
            continue;
        }
        
        if (leave) {
            absentDays++;
            if (user.messPlan === 'full_day') {
                if (leave.type === 'lunch_only') { halfDays++; totalMeals++; }
                if (leave.type === 'dinner_only') { halfDays++; totalMeals++; }
            }
        } else {
            if (user.messPlan === 'full_day') { fullDays++; totalMeals += 2; }
            else { halfDays++; totalMeals++; }
        }
    }
    
    return {
        totalMeals, chargePerMeal: CHARGE_PER_MEAL, totalDaysInMonth: daysInMonth,
        holidays: holidayCount, billableDays: daysInMonth - holidayCount,
        fullDays, halfDays, absentDays
    };
};

export default function StudentBillsPage() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [amountToConfirm, setAmountToConfirm] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    let leavesUnsubscribe: (() => void) | null = null;
    if (user) {
        leavesUnsubscribe = onLeavesUpdate(user.uid, setLeaves);
    }
    const holidaysUnsubscribe = onHolidaysUpdate((updatedHolidays) => {
        setHolidays(updatedHolidays);
        if(user) setIsLoading(false);
    });
    return () => {
        if (leavesUnsubscribe) leavesUnsubscribe();
        holidaysUnsubscribe();
    };
  }, [user]);

  const dynamicallyGeneratedBills = useMemo(() => {
    if (!user || isLoading) return [];

    const bills: Bill[] = [];
    const today = new Date();
    // Simulate payment history for consistent demo
    const paymentHistory: {[key: string]: { amount: number; date: string }[]} = {
      '2023-09': [{ amount: 3380, date: '2023-10-04' }],
      '2023-08': [{ amount: 1000, date: '2023-09-10' }, { amount: 1000, date: '2023-09-20' }],
      '2023-10': [{ amount: 3445, date: '2023-11-05' }],
    };

    for (let i = 0; i < 4; i++) {
        const monthDate = startOfMonth(subMonths(today, i));
        const demoMonthDate = startOfMonth(subMonths(new Date(2023, 10, 1), i));

        const userLeaves = leaves.filter(l => l.studentId === user.uid);
        const details = calculateBillDetailsForMonth(demoMonthDate, user, holidays, userLeaves);
        const totalAmount = details.totalMeals * details.chargePerMeal;
        const monthKey = format(demoMonthDate, 'yyyy-MM');
        const payments = paymentHistory[monthKey] || [];

        bills.push({
            id: `bill-${monthKey}`,
            month: format(demoMonthDate, 'MMMM'),
            year: getYear(demoMonthDate),
            generationDate: format(startOfMonth(subMonths(today, i - 1)), 'yyyy-MM-dd'),
            totalAmount,
            payments,
            status: totalAmount - payments.reduce((sum, p) => sum + p.amount, 0) > 0 ? 'Due' : 'Paid',
            details,
        });
    }
    return bills.reverse();
  }, [user, holidays, leaves, isLoading]);

  const handleOpenPaymentDialog = (bill: Bill) => setSelectedBill(bill);
  const handleClosePaymentDialogs = () => {
    setSelectedBill(null);
    setIsCashPaymentOpen(false);
    setCustomAmount('');
    setIsConfirmingPayment(false);
    setAmountToConfirm(null);
  };

  const handleMakePayment = (amountToPay: number) => {
    // This is a mock function, in a real app this would call a server action
    if (!selectedBill || isNaN(amountToPay) || amountToPay <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive number.' });
      return;
    }
    const paidAmount = getPaidAmount(selectedBill);
    const dueAmount = selectedBill.totalAmount - paidAmount;
    if (amountToPay > dueAmount) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: `Payment cannot be more than the due amount of ₹${dueAmount.toLocaleString()}.` });
      return;
    }
    toast({ title: 'Payment Recorded', description: `A payment of ₹${amountToPay.toLocaleString()} for your ${selectedBill.month} bill has been recorded. This is a demo and will reset.` });
    handleClosePaymentDialogs();
  };

  const dueBillForDialog = selectedBill ? selectedBill.totalAmount - getPaidAmount(selectedBill) : 0;
  
  const initiatePaymentConfirmation = (amount: number) => {
      if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive number.' });
        return;
      }
      setAmountToConfirm(amount);
      setIsConfirmingPayment(true);
  };
  
  if (isLoading || !user) {
    return (
        <div className="space-y-4">
             <Skeleton className="h-10 w-48" />
             <Skeleton className="h-40 w-full" />
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-20 w-full" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">My Bills</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
                <ShieldAlert className="mr-2 h-4 w-4 text-destructive" />
                View Reminders
                {paymentReminders.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 h-6 w-6 flex items-center justify-center rounded-full">
                        {paymentReminders.length}
                    </Badge>
                )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Due Reminders</DialogTitle>
                <DialogDescription>
                    Important notifications from the admin regarding your pending payments.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                {paymentReminders.length > 0 ? (
                    paymentReminders.map((reminder) => (
                        <Alert key={reminder.id} variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>{reminder.title}</AlertTitle>
                            <AlertDescription>
                                {reminder.message}
                                <p className="text-xs text-destructive-foreground/80 mt-2">
                                    Received on: {format(new Date(reminder.date), 'MMMM do, yyyy')}
                                </p>
                            </AlertDescription>
                        </Alert>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        You have no pending payment reminders.
                    </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            A record of all your past and present mess bills. Click on a bill to
            view details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dynamicallyGeneratedBills.map((bill) => {
            const paidAmount = getPaidAmount(bill);
            const dueAmount = bill.totalAmount - paidAmount;

            return (
              <Card
                key={bill.id}
                className="hover:border-primary/50 transition-all duration-150 group"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-[200px]">
                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <Receipt className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {bill.month} {bill.year}
                          </p>
                           <p className="text-sm text-muted-foreground">
                            Paid:{' '}
                            <span
                              className={cn(
                                paidAmount > 0
                                  ? 'text-green-400'
                                  : 'text-muted-foreground'
                              )}
                            >
                              ₹{paidAmount.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                     <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
                       <DialogHeader className="sr-only">
                         <DialogTitle>Bill Details: {bill.month} {bill.year}</DialogTitle>
                         <DialogDescription>
                             A detailed breakdown of your bill for {bill.month} {bill.year}, including attendance and payment history.
                         </DialogDescription>
                       </DialogHeader>
                      <BillDetailDialog bill={bill} onPayNow={() => handleOpenPaymentDialog(bill)} leaves={leaves} holidays={holidays} />
                    </DialogContent>
                  </Dialog>

                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-center justify-center w-32">
                       <p className="text-xl font-bold">
                        ₹{bill.totalAmount.toLocaleString()}
                      </p>
                       <Badge
                        variant={dueAmount > 0 ? 'destructive' : 'secondary'}
                        className={cn(
                          'text-sm font-normal h-7 w-full justify-center mt-1',
                          dueAmount <= 0 && 'border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80'
                        )}
                      >
                        Due: ₹{dueAmount.toLocaleString()}
                      </Badge>
                    </div>
                    <Button onClick={() => handleOpenPaymentDialog(bill)} disabled={dueAmount <= 0}>
                        <Wallet className="mr-2 h-4 w-4" /> Pay Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment Method Dialog */}
      <AlertDialog
        open={!!selectedBill && !isCashPaymentOpen && !isConfirmingPayment}
        onOpenChange={(open) => !open && handleClosePaymentDialogs()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              You have a due amount of ₹{dueBillForDialog.toLocaleString()} for
              the {selectedBill?.month} bill. How would you like to pay?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button variant="outline" disabled>
              <CreditCard /> Pay Online (Coming Soon)
            </Button>
            <Button onClick={() => setIsCashPaymentOpen(true)}>
              <Banknote /> Pay with Cash
            </Button>
          </AlertDialogFooter>
          <AlertDialogCancel
            className="w-full mt-2"
            onClick={handleClosePaymentDialogs}
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cash Payment Dialog */}
      <Dialog
        open={isCashPaymentOpen && !isConfirmingPayment}
        onOpenChange={(open) => !open && handleClosePaymentDialogs()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay with Cash</DialogTitle>
            <DialogDescription>
              Confirm the amount to pay for your {selectedBill?.month} bill. The
              due amount is ₹{dueBillForDialog.toLocaleString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Instructions</AlertTitle>
              <AlertDescription>
                Please hand over the cash amount to the mess admin to complete
                this transaction.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Enter Amount (INR)</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder={`e.g., ${dueBillForDialog.toLocaleString()}`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
          </div>
          <CardFooter className="flex-col sm:flex-row p-0 gap-2">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => initiatePaymentConfirmation(dueBillForDialog)}
              disabled={dueBillForDialog <= 0}
            >
              Pay Full Amount (₹{dueBillForDialog.toLocaleString()})
            </Button>
            <Button
              className="w-full sm:w-auto flex-1"
              onClick={() => initiatePaymentConfirmation(parseFloat(customAmount))}
            >
              Submit Payment
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
      
      {/* Final Confirmation Dialog */}
       <AlertDialog open={isConfirmingPayment} onOpenChange={setIsConfirmingPayment}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cash Payment</AlertDialogTitle>
            <AlertDialogDescription>
                You are about to record a cash payment of{' '}
                <span className="font-bold text-foreground">₹{amountToConfirm?.toLocaleString()}</span>. 
                Please ensure you have handed this amount to the mess admin.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMakePayment(amountToConfirm!)}>
                Confirm Payment
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

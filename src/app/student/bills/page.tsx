

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Holiday, Leave, AppUser, Bill, BillDetails } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { cn } from '@/lib/utils';
import { Receipt, Wallet, CreditCard, Banknote, Info, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { BillDetailDialog } from '@/components/student/bill-detail-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format, getMonth, getYear, getDaysInMonth, isSameDay, startOfMonth, subMonths, parseISO, isFuture, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const CHARGE_PER_MEAL = 65;

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

    const joinDate = user.joinDate ? startOfDay(parseISO(user.joinDate)) : new Date(0);

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        if (isFuture(day) || day < joinDate) continue;

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  
  const billIdToView = searchParams.get('view');

  useEffect(() => {
    if (!user || !user.uid || !user.messId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    
    const leavesUnsubscribe = onLeavesUpdate(user.uid, setLeaves);

    const holidaysUnsubscribe = onHolidaysUpdate(user.messId, (updatedHolidays) => {
        setHolidays(updatedHolidays);
        if(user) setIsLoading(false);
    });
    return () => {
        leavesUnsubscribe();
        holidaysUnsubscribe();
    };
  }, [user]);

  const dynamicallyGeneratedBills = useMemo(() => {
    if (!user || isLoading) return [];

    const bills: Bill[] = [];
    const today = new Date();
    const joinDate = user.joinDate ? startOfDay(parseISO(user.joinDate)) : new Date(0);
    
    // Generate bills from join month up to current month
    let loopDate = startOfMonth(joinDate);
    while (loopDate <= today) {
        const userLeaves = leaves.filter(l => l.studentId === user.uid);
        const details = calculateBillDetailsForMonth(loopDate, user, holidays, userLeaves);
        const totalAmount = details.totalMeals * details.chargePerMeal;
        
        // In a real app, payments would be fetched from Firestore.
        // For now, payments are an empty array.
        const payments: Bill['payments'] = [];

        bills.push({
            id: `bill-${format(loopDate, 'yyyy-MM')}`,
            month: format(loopDate, 'MMMM'),
            year: getYear(loopDate),
            generationDate: format(startOfMonth(subMonths(today, -1)), 'yyyy-MM-dd'),
            totalAmount,
            payments,
            status: totalAmount - getPaidAmount({payments} as Bill) > 0 ? 'Due' : 'Paid',
            details,
        });

        loopDate = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 1);
    }

    return bills.reverse();
  }, [user, holidays, leaves, isLoading]);
  
  const openedBill = useMemo(() => {
      if (!billIdToView) return null;
      return dynamicallyGeneratedBills.find(b => b.id === billIdToView) || null;
  }, [billIdToView, dynamicallyGeneratedBills]);

  const handleOpenDetailDialog = (billId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', billId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseDetailDialog = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('view');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleOpenPaymentDialog = (bill: Bill) => {
    handleCloseDetailDialog(); // Close detail view first
    setTimeout(() => { // Allow state to update before opening next dialog
        setSelectedBill(bill);
    }, 150);
  };
  
  const handleClosePaymentDialogs = () => {
    setSelectedBill(null);
    setIsCashPaymentOpen(false);
    setCustomAmount('');
    setIsConfirmingPayment(false);
    setAmountToConfirm(null);
  };

  const handleMakePayment = (amountToPay: number) => {
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
                <div className="text-center text-muted-foreground py-4">
                    You have no pending payment reminders.
                </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 sm:p-4">
            {dynamicallyGeneratedBills.length > 0 ? dynamicallyGeneratedBills.map((bill) => {
              const paidAmount = getPaidAmount(bill);
              const dueAmount = bill.totalAmount - paidAmount;
              const billDate = new Date(bill.year, getMonth(new Date(bill.month + " 1, 2000")));

              return (
                <div key={bill.id} className="p-3 flex items-center gap-3 border-b sm:border sm:rounded-lg hover:bg-secondary/30 transition-all duration-150 group">
                    <button onClick={() => handleOpenDetailDialog(bill.id)} className="flex-1 flex items-center gap-3 cursor-pointer text-left w-full">
                        <div className="p-2.5 rounded-full bg-secondary/80 group-hover:bg-secondary border group-hover:border-primary/20 transition-colors">
                            <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-base truncate">{format(billDate, 'MMM')} {bill.year}</h3>
                                <p className="text-xs text-muted-foreground">Total: ₹{bill.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Badge variant={dueAmount > 0 ? 'destructive' : 'secondary'} className={cn('text-xs', dueAmount <= 0 && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>
                            Due: ₹{dueAmount.toLocaleString()}
                        </Badge>
                        <Button size="sm" onClick={() => setSelectedBill(bill)} disabled={dueAmount <= 0} className="h-8 px-2.5 text-xs sm:px-3 sm:text-sm">
                          <Wallet className="mr-1.5 h-3.5 w-3.5" /> <span className="hidden sm:inline">Pay</span>
                        </Button>
                    </div>
                  </div>
              );
            }) : (
                 <div className="p-8 text-center text-muted-foreground">
                    <p>No bills generated yet.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Bill Detail Dialog controlled by URL */}
      <Dialog open={!!openedBill} onOpenChange={(open) => {if(!open) handleCloseDetailDialog()}}>
          <DialogContent className="p-0 w-[90vw] max-w-[500px] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            {openedBill && (
              <BillDetailDialog bill={openedBill} onPayNow={() => handleOpenPaymentDialog(openedBill)} leaves={leaves} holidays={holidays} />
            )}
          </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog
        open={!!selectedBill && !isCashPaymentOpen && !isConfirmingPayment}
        onOpenChange={(open) => !open && handleClosePaymentDialogs()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              You have a due amount of ₹{dueBillForDialog.toLocaleString()} for
              the {selectedBill?.month} bill. How would you like to pay?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button variant="outline" disabled>
              <CreditCard /> Pay Online (Coming Soon)
            </Button>
            <Button onClick={() => setIsCashPaymentOpen(true)}>
              <Banknote /> Pay with Cash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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
          <DialogFooter>
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
          </DialogFooter>
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

    

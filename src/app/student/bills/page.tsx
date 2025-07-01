'use client';

import { useState } from 'react';
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
import { billHistory as initialBillHistory, Bill, paymentReminders } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  X,
  Info,
  ShieldAlert,
} from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const getPaidAmount = (bill: Bill) => bill.payments.reduce((sum, p) => sum + p.amount, 0);

export default function StudentBillsPage() {
  const [bills, setBills] = useState<Bill[]>(initialBillHistory);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [amountToConfirm, setAmountToConfirm] = useState<number | null>(null);

  const { toast } = useToast();

  const handleOpenPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
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
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid positive number.',
      });
      return;
    }

    const paidAmount = getPaidAmount(selectedBill);
    const dueAmount = selectedBill.totalAmount - paidAmount;
    
    if (amountToPay > dueAmount) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: `Payment cannot be more than the due amount of ₹${dueAmount.toLocaleString()}.`,
      });
      return;
    }

    setBills((prevBills) =>
      prevBills.map((b) => {
        if (b.id === selectedBill.id) {
          const newPayments = [...b.payments, { amount: amountToPay, date: format(new Date(), 'yyyy-MM-dd') }];
          return { ...b, payments: newPayments };
        }
        return b;
      })
    );

    toast({
      title: 'Payment Recorded',
      description: `A payment of ₹${amountToPay.toLocaleString()} for your ${selectedBill.month} bill has been recorded.`,
    });

    handleClosePaymentDialogs();
  };

  const dueBillForDialog = selectedBill ? selectedBill.totalAmount - getPaidAmount(selectedBill) : 0;
  
  const initiatePaymentConfirmation = (amount: number) => {
      if (isNaN(amount) || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a valid positive number.',
        });
        return;
      }
      setAmountToConfirm(amount);
      setIsConfirmingPayment(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bills</h1>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-destructive"/>
                <div>
                    <CardTitle>Due Reminders</CardTitle>
                    <CardDescription>
                        Important notifications from the admin regarding your pending payments.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            A record of all your past and present mess bills. Click on a bill to
            view details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bills.map((bill) => {
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
                      <BillDetailDialog bill={bill} onPayNow={() => handleOpenPaymentDialog(bill)} />
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

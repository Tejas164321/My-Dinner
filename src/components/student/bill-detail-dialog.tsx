

'use client';

import { useMemo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Bill, Holiday, Leave, Payment } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { FileDown, Wallet, Loader2, Hourglass, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AttendanceCalendar } from '@/components/shared/attendance-calendar';
import { BillInvoice } from './bill-invoice';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { getMessInfo, type MessInfo } from '@/lib/services/mess';

const monthMap: { [key: string]: number } = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

const getPaidAmount = (payments: Payment[]) => payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0);
const getPendingAmount = (payments: Payment[]) => payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);


interface BillDetailDialogProps {
  bill: Bill;
  onPayNow: (bill: Bill) => void;
  holidays: Holiday[];
  leaves: Leave[];
}

export function BillDetailDialog({ bill, onPayNow, holidays, leaves }: BillDetailDialogProps) {
  const { user: student } = useAuth();
  const [messInfo, setMessInfo] = useState<MessInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const monthIndex = monthMap[bill.month];
  const monthDate = new Date(bill.year, monthIndex, 1);
  
  const paidAmount = getPaidAmount(bill.payments);
  const pendingAmount = getPendingAmount(bill.payments);
  const dueAmount = bill.totalAmount - paidAmount - pendingAmount;
    
  useEffect(() => {
    if (student?.messId) {
        getMessInfo(student.messId).then(setMessInfo);
    }
  }, [student?.messId]);

  const getStatusInfo = () => {
    if (dueAmount > 0) return { variant: 'destructive' as const, className: '', text: 'Due' };
    if (pendingAmount > 0) return { variant: 'outline' as const, className: 'border-yellow-500/50 text-yellow-500', text: 'Pending' };
    return { variant: 'secondary' as const, className: 'border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80', text: 'Paid' };
  };

  const statusInfo = getStatusInfo();
  
  const handleDownload = async () => {
        if (!student) return;
        setIsDownloading(true);
        const invoiceElement = document.getElementById(`invoice-${bill.id}`);
        if (invoiceElement) {
            try {
                const canvas = await html2canvas(invoiceElement, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jspdf('p', 'px', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`MessoMate-Bill-${bill.month}-${bill.year}.pdf`);
            } catch (error) {
                console.error("Error generating PDF:", error);
            }
        }
        setIsDownloading(false);
    };

  if (!student) return null;

  return (
    <>
      <DialogHeader className="p-4 md:p-6 pb-0">
        <DialogTitle className="text-xl">Bill for {bill.month} {bill.year}</DialogTitle>
      </DialogHeader>
      <div className="bg-background grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 md:p-6">
          {/* --- Left Column: Billing & Attendance Summary --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Billing Details */}
              <div className="space-y-3">
                  <h3 className="font-semibold text-base">Billing Summary</h3>
                  <div className="space-y-3 text-sm p-3 md:p-4 border rounded-lg bg-secondary/30">
                      <div className="flex justify-between items-center">
                          <p className="text-muted-foreground">Billable Meals</p>
                          <p>{bill.details.totalMeals} meals x ₹{bill.details.chargePerMeal.toLocaleString()}</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center font-semibold text-lg">
                          <p>Total Bill</p>
                          <p>₹{bill.totalAmount.toLocaleString()}</p>
                      </div>
                      
                      {/* Confirmed Payments Section */}
                      {paidAmount > 0 && (
                          <div className="pt-2">
                              <div className="flex justify-between items-center text-green-400">
                                  <p className="text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4" />Paid</p>
                                  <p>- ₹{paidAmount.toLocaleString()}</p>
                              </div>
                          </div>
                      )}
                      
                      {/* Pending Payments Section */}
                       {pendingAmount > 0 && (
                          <div className="pt-2">
                              <div className="flex justify-between items-center text-yellow-500">
                                  <p className="text-muted-foreground flex items-center gap-2"><Hourglass className="h-4 w-4" />Pending Confirmation</p>
                                  <p>- ₹{pendingAmount.toLocaleString()}</p>
                              </div>
                          </div>
                      )}

                      <Separator />
                      <div className="flex justify-between items-center font-semibold text-lg">
                          <div className="flex items-center gap-2">
                              <p>Final Due</p>
                              <Badge variant={statusInfo.variant} className={cn('capitalize', statusInfo.className)}>
                                  {statusInfo.text}
                              </Badge>
                          </div>
                          <p className={cn(dueAmount > 0 ? 'text-destructive' : 'text-foreground')}>
                              ₹{dueAmount.toLocaleString()}
                          </p>
                      </div>
                  </div>
              </div>

               {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                  <Button variant="outline" className="w-full" onClick={handleDownload} disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="animate-spin" /> : <FileDown />}
                      {isDownloading ? 'Downloading...' : 'Download Bill'}
                  </Button>
                  {dueAmount > 0 && (
                      <Button className="w-full" onClick={() => onPayNow(bill)}>
                          <Wallet /> Pay Now
                      </Button>
                  )}
              </div>
          </div>
          
          {/* --- Right Column: Calendar --- */}
          <div className="lg:col-span-3 flex flex-col gap-4">
               <h3 className="font-semibold text-base">Attendance Details</h3>
               <div className="p-3 border rounded-lg bg-secondary/30 flex flex-col flex-1">
                  {/* Attendance Summary Stats */}
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div>
                          <p className="text-2xl font-bold text-green-400">{bill.details.totalMeals}</p>
                          <p className="text-xs text-muted-foreground">Total Meals</p>
                      </div>
                      <div>
                          <p className="text-2xl font-bold text-yellow-400">{bill.details.fullDays}</p>
                          <p className="text-xs text-muted-foreground">Present Days</p>
                      </div>
                      <div>
                          <p className="text-2xl font-bold text-blue-400">{bill.details.holidays}</p>
                          <p className="text-xs text-muted-foreground">Holidays</p>
                      </div>
                      <div>
                          <p className="text-2xl font-bold text-destructive">{bill.details.absentDays}</p>
                          <p className="text-xs text-muted-foreground">Absent Days</p>
                      </div>
                  </div>
                  
                  <Separator className="my-3"/>
                  
                  {/* Calendar */}
                  <div className="flex-grow flex items-center justify-center p-0">
                       <AttendanceCalendar user={student} leaves={leaves} holidays={holidays} month={monthDate} onMonthChange={() => {}} />
                  </div>
                  {/* Legend */}
                  <div className="p-0 pt-3 mt-auto">
                      <div className="flex w-full items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />Present</div>
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />Holiday</div>
                          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background"></div>Today</div>
                      </div>
                  </div>
               </div>
          </div>
      </div>
       {/* Hidden component for PDF generation */}
        <div className="absolute -left-[9999px] -top-[9999px]">
            {messInfo && <BillInvoice bill={bill} student={student} holidays={holidays} leaves={leaves} messInfo={messInfo} />}
        </div>
    </>
  );
}

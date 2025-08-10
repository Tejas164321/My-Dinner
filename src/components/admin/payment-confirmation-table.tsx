

'use client';

import type { Payment } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, X, Loader2, BadgeCheck, FileWarning } from 'lucide-react';
import { format } from 'date-fns';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

interface PaymentConfirmationTableProps {
    payments: Payment[];
    isLoading: boolean;
}

export function PaymentConfirmationTable({ payments, isLoading }: PaymentConfirmationTableProps) {
    const { toast } = useToast();
    const { user: adminUser } = useAuth();

    const handleUpdatePayment = async (paymentId: string, status: 'confirmed' | 'rejected') => {
        if (!adminUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
            return;
        }

        const paymentRef = doc(db, 'payments', paymentId);
        try {
            const batch = writeBatch(db);
            batch.update(paymentRef, {
                status,
                confirmedBy: adminUser.uid,
                confirmationDate: new Date().toISOString(),
            });
            await batch.commit();
            toast({ title: `Payment ${status}`, description: `The payment has been marked as ${status}.` });
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update payment status.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Cash Payments</CardTitle>
                <CardDescription>Review and confirm cash payments submitted by students.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="hidden sm:table-cell">Bill Period</TableHead>
                                <TableHead className="hidden sm:table-cell">Request Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : payments.length > 0 ? (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.studentName}</TableCell>
                                        <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{payment.billMonth} {payment.billYear}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{format(new Date(payment.date), 'MMM do, yyyy')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button onClick={() => handleUpdatePayment(payment.id, 'confirmed')} variant="ghost" size="icon" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => handleUpdatePayment(payment.id, 'rejected')} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-40 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <BadgeCheck className="h-10 w-10" />
                                            <p className="font-semibold">All caught up!</p>
                                            <p>There are no pending payments to confirm.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

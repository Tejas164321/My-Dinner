'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { billHistory, Bill } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Receipt, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BillDetailDialog } from "@/components/student/bill-detail-dialog";

export default function StudentBillsPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Bills</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>A record of all your past and present mess bills. Click on a bill to view details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {billHistory.map((bill) => (
                        <Card key={bill.id} className="hover:border-primary/50 transition-all duration-150 group">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="flex items-center gap-4 flex-1 cursor-pointer">
                                            <div className="bg-secondary/50 p-3 rounded-lg">
                                                <Receipt className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{bill.month} {bill.year}</p>
                                                <p className="text-sm text-muted-foreground">Generated on: {bill.generationDate}</p>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
                                        <DialogHeader className="sr-only">
                                            <DialogTitle>Bill Details for {bill.month} {bill.year}</DialogTitle>
                                            <DialogDescription>
                                                Detailed breakdown of your mess bill for {bill.month} {bill.year}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <BillDetailDialog bill={bill} />
                                    </DialogContent>
                                </Dialog>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-bold">₹{bill.totalAmount.toLocaleString()}</p>
                                        <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7 w-20 justify-center", bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{bill.status}</Badge>
                                    </div>
                                    {bill.status === 'Due' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button><Wallet className="mr-2 h-4 w-4" /> Pay Now</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Choose Payment Method</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        How would you like to pay your bill of ₹{bill.totalAmount.toLocaleString()}?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="grid grid-cols-2 gap-4">
                                                    <AlertDialogAction>Pay Online</AlertDialogAction>
                                                    <AlertDialogCancel>Pay with Cash</AlertDialogCancel>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

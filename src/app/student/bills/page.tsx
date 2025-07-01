'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { billHistory, Bill } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Receipt, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
                        <Dialog key={bill.id}>
                            <DialogTrigger asChild>
                                <button className="w-full text-left">
                                    <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-150 group">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-secondary/50 p-3 rounded-lg">
                                                    <Receipt className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg">{bill.month} {bill.year}</p>
                                                    <p className="text-sm text-muted-foreground">Generated on: {bill.generationDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xl font-bold">₹{bill.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7 w-20 justify-center", bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{bill.status}</Badge>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </button>
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
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { billHistory } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Receipt } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function StudentBillsPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Bills</h1>
                <p className="text-muted-foreground">Review your billing history and manage payments.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>A record of all your past and present mess bills.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {billHistory.map((bill, index) => (
                            <AccordionItem key={bill.id} value={`item-${index}`}>
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-secondary/50 p-2.5 rounded-lg">
                                                <Receipt className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-base text-left">{bill.month}</p>
                                                <p className="text-xs text-muted-foreground text-left">Bill generated on: {bill.generationDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-lg font-semibold w-28 text-right">₹{bill.totalAmount.toLocaleString()}</p>
                                            <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7 w-20 justify-center", bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{bill.status}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-4 bg-secondary/30 rounded-lg ml-16">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold">Bill Details</h4>
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="text-muted-foreground">Total Meals</p>
                                                <p>{bill.details.totalMeals} meals</p>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="text-muted-foreground">Charge per Meal</p>
                                                <p>₹{bill.details.chargePerMeal.toLocaleString()}</p>
                                            </div>
                                             <div className="flex justify-between items-center text-sm">
                                                <p className="text-muted-foreground">Rebate for Leaves</p>
                                                <p className="text-green-400">- ₹{bill.details.rebate.toLocaleString()}</p>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center font-semibold">
                                                <p>Total Amount</p>
                                                <p>₹{bill.totalAmount.toLocaleString()}</p>
                                            </div>
                                            {bill.status === 'Due' && (
                                                <Button className="w-full mt-4">
                                                    <CircleDollarSign className="mr-2" /> Pay Now
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}

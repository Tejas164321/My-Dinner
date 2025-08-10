
'use client';

import type { Bill, Holiday, Leave, AppUser } from '@/lib/data';
import { ChefHat } from 'lucide-react';
import { format } from 'date-fns';
import type { MessInfo } from '@/lib/services/mess';
import { cn } from '@/lib/utils';

interface BillInvoiceProps {
    bill: Bill;
    student: AppUser;
    holidays: Holiday[];
    leaves: Leave[];
    messInfo: MessInfo;
}

const formatPlanName = (plan?: 'full_day' | 'lunch_only' | 'dinner_only') => {
    if (!plan) return 'N/A';
    return plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const BillInvoice = ({ bill, student, messInfo }: BillInvoiceProps) => {
    const paidAmount = bill.payments.reduce((sum, p) => sum + p.amount, 0);
    const dueAmount = bill.totalAmount - paidAmount;

    return (
        <div id={`invoice-${bill.id}`} className="p-10 bg-white text-gray-800 w-[820px] font-sans text-sm">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white p-3 rounded-xl">
                        <ChefHat className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">MessoMate</h1>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold uppercase text-gray-300 tracking-wider">Invoice</h2>
                    <p className="text-xs text-gray-400"># {bill.id.slice(-8)}</p>
                </div>
            </div>

            {/* Bill To & From */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                    <p className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">Billed To</p>
                    <p className="font-extrabold text-lg text-gray-900">{student.name}</p>
                    <p className="text-gray-600">Student ID: {student.studentId || 'N/A'}</p>
                    <p className="text-gray-600">Room No: {student.roomNo || 'N/A'}</p>
                    <p className="text-gray-600">Contact: {student.contact || 'N/A'}</p>
                    <p className="text-gray-600">Email: {student.email}</p>
                </div>
                 <div className="text-right">
                    <p className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">Billed By</p>
                    <p className="font-extrabold text-lg text-gray-900">{messInfo.messName}</p>
                    <p className="text-gray-600">{messInfo.address || 'Address not provided'}</p>
                    <p className="text-gray-600">
                        {messInfo.contactEmail && <span>{messInfo.contactEmail}</span>}
                    </p>
                     <p className="text-gray-600">
                        {messInfo.contactPhone && <span>{messInfo.contactPhone}</span>}
                    </p>
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-8 mt-4">
                <div>
                    <p className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">Invoice Details</p>
                    <p className="font-bold text-gray-600">Invoice Date: <span className="font-normal">{format(new Date(), 'MMMM do, yyyy')}</span></p>
                    <p className="font-bold text-gray-600">Billing Period: <span className="font-normal">{bill.month} {bill.year}</span></p>
                    <p className="font-bold text-gray-600">Meal Plan: <span className="font-normal">{formatPlanName(student.messPlan)}</span></p>
                </div>
            </div>

            {/* Bill Details Table */}
            <div className="mt-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100 text-gray-500 uppercase text-xs">
                            <th className="p-3 font-semibold rounded-l-lg">Description</th>
                            <th className="p-3 text-center font-semibold">Quantity</th>
                            <th className="p-3 text-center font-semibold">Rate</th>
                            <th className="p-3 text-right font-semibold rounded-r-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="p-3">Total Meals Consumed</td>
                            <td className="p-3 text-center">{bill.details.totalMeals}</td>
                            <td className="p-3 text-center">₹{bill.details.chargePerMeal.toLocaleString()}</td>
                            <td className="p-3 text-right">₹{bill.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
                <div className="w-full max-w-sm space-y-3 text-gray-700">
                    <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>₹{bill.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>Payments Made</p>
                        <p className="text-green-600">- ₹{paidAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-gray-200 pt-3 text-gray-900">
                        <p>Amount Due</p>
                        <p>₹{dueAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

             {/* Attendance Summary */}
            <div className="mt-10 pt-6 border-t-2 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Attendance Summary for {bill.month}</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-2 bg-gray-50 rounded-md">
                        <p className="font-bold text-lg text-gray-900">{bill.details.fullDays + bill.details.halfDays}</p>
                        <p className="text-xs text-gray-500">Present Days</p>
                    </div>
                     <div className="p-2 bg-gray-50 rounded-md">
                        <p className="font-bold text-lg text-gray-900">{bill.details.absentDays}</p>
                        <p className="text-xs text-gray-500">Leave Days</p>
                    </div>
                     <div className="p-2 bg-gray-50 rounded-md">
                        <p className="font-bold text-lg text-gray-900">{bill.details.holidays}</p>
                        <p className="text-xs text-gray-500">Holidays</p>
                    </div>
                     <div className="p-2 bg-gray-50 rounded-md">
                        <p className="font-bold text-lg text-gray-900">{bill.details.totalMeals}</p>
                        <p className="text-xs text-gray-500">Total Meals Taken</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 mt-16 pt-6 border-t-2 border-gray-100">
                <p>Thank you for your timely payment. Have a great day!</p>
                <p className="font-semibold">{messInfo.messName}</p>
            </div>
        </div>
    );
};

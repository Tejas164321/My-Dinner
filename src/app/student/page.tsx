import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, CalendarDays, FileText, Bell, CheckCircle, Clock, PartyPopper } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StudentDashboard() {
  const today = new Date();
  const todayMenu = {
    lunch: "Rajma Chawal, Salad",
    dinner: "Chole Bhature",
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Welcome back, Alex!</CardTitle>
              <CardDescription>Here's what's happening today, {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</CardDescription>
            </div>
            <Button>Apply for Leave</Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <CardTitle>Today's Menu</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg">Lunch</h3>
              <p className="text-muted-foreground">{todayMenu.lunch}</p>
            </div>
            <div className="sm:border-l sm:border-border sm:pl-6">
              <h3 className="font-semibold text-lg">Dinner</h3>
              <p className="text-muted-foreground">{todayMenu.dinner}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>My Bill</CardTitle>
                <Badge variant="destructive" className="ml-auto">Due</Badge>
            </div>
             <CardDescription>For October 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">₹ 3,250.00</p>
            <Button className="w-full mt-4">Pay Now</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <CardTitle>Attendance</CardTitle>
                </div>
                <CardDescription>Your summary for this month.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center text-lg">
                    <span>Present</span>
                    <span className="font-bold">25 <span className="text-sm text-muted-foreground">Days</span></span>
                </div>
                <Separator className="my-3"/>
                <div className="flex justify-between items-center text-lg">
                    <span>On Leave</span>
                    <span className="font-bold">2 <span className="text-sm text-muted-foreground">Days</span></span>
                </div>
                <Separator className="my-3"/>
                <div className="flex justify-between items-center text-lg">
                    <span>Total</span>
                    <span className="font-bold text-primary">27 <span className="text-sm text-primary/80">Days</span></span>
                </div>
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Recent Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="bg-green-500/20 text-green-400 rounded-full p-2 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Leave Approved</p>
                  <p className="text-sm text-muted-foreground">Your leave for Oct 28 has been approved.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-purple-500/20 text-purple-400 rounded-full p-2 mt-1">
                  <PartyPopper className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Holiday: Diwali</p>
                  <p className="text-sm text-muted-foreground">Mess will be closed on Oct 30.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

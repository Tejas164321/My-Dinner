import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Calendar, Sun, Moon, ArrowRight, FileText, Bell, DollarSign, MessageSquare } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StudentDashboard() {
  const today = new Date();
  
  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">Here's your dashboard for {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <CardTitle>Today's Menu</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4">
                <div className="bg-secondary p-3 rounded-lg mt-1">
                    <Sun className="h-6 w-6 text-yellow-400"/>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Lunch</h3>
                    <p className="text-muted-foreground">Rajma Chawal, Salad</p>
                </div>
            </div>
            <div className="flex items-start gap-4 sm:border-l sm:pl-6">
                 <div className="bg-secondary p-3 rounded-lg mt-1">
                    <Moon className="h-6 w-6 text-purple-400"/>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Dinner</h3>
                    <p className="text-muted-foreground">Chole Bhature</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start">
                <Calendar className="mr-2"/> Apply for Leave
            </Button>
            <Button variant="outline" className="justify-start">
                <Utensils className="mr-2"/> View Full Menu
            </Button>
            <Button variant="outline" className="justify-start">
                <MessageSquare className="mr-2"/> Give Feedback
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
        <CardHeader>
          <CardTitle>My Activity</CardTitle>
          <CardDescription>An overview of your recent mess activity.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary"/>
                        <h3 className="font-semibold">Attendance</h3>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <p className="text-3xl font-bold">25<span className="text-lg text-muted-foreground">/27 Days</span></p>
                        <Badge variant="secondary">92%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Your attendance for the current month is looking great.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary"/>
                        <h3 className="font-semibold">Billing</h3>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <p className="text-3xl font-bold">₹3,250</p>
                        <Badge variant="destructive">Due</Badge>
                    </div>
                     <p className="text-sm text-muted-foreground">Your bill for October is pending. Please pay on time.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary"/>
                        <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex justify-between items-center">Your leave for Oct 28 was approved. <span className="text-xs">2d ago</span></li>
                        <li className="flex justify-between items-center">Mess closed for Diwali on Oct 30. <span className="text-xs">4d ago</span></li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

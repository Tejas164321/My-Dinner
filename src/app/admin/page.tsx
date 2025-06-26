import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Bell, PlusCircle } from 'lucide-react';
import { AttendanceChart, BehaviorChart } from '@/components/admin/analytics-charts';
import { StudentsTable } from '@/components/admin/students-table';
import { MenuSchedule } from '@/components/admin/menu-schedule';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Up from 88% yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Join Requests</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3</div>
            <p className="text-xs text-muted-foreground">Waiting for approval</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mess Join Code</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-mono tracking-widest">XF4G8K</div>
            <Button size="sm">Regenerate</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="students">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <TabsList>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/> Add Holiday</Button>
                    <Button><Bell className="mr-2 h-4 w-4"/> Announce</Button>
                </div>
            </div>
            <TabsContent value="students" className="mt-4">
                <StudentsTable />
            </TabsContent>
            <TabsContent value="menu" className="mt-4">
              <MenuSchedule />
            </TabsContent>
             <TabsContent value="analytics" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Trends</CardTitle>
                        <CardDescription>Monthly attendance summary for all students.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-2">
                        <AttendanceChart />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Student Behavior</CardTitle>
                    <CardDescription>Breakdown of common student actions.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] p-0">
                    <BehaviorChart />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Leave Settings</CardTitle>
                    <CardDescription>Configure leave locking policies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="locking-enabled">Enable Leave Locking</Label>
                        <Switch id="locking-enabled" defaultChecked />
                    </div>
                    <div className="space-y-2">
                        <Label>Locking Time for Lunch</Label>
                        <p className="text-muted-foreground text-sm">Students cannot apply for leave after this time.</p>
                        <p className="font-mono text-lg">10:00 AM</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Locking Time for Dinner</Label>
                        <p className="text-muted-foreground text-sm">Students cannot apply for leave after this time.</p>
                        <p className="font-mono text-lg">05:00 PM</p>
                    </div>
                    <Button variant="outline" className="w-full">Update Settings</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

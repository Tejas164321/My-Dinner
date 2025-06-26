'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { attendanceData, studentBehaviorData } from '@/lib/data';

export function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
          wrapperStyle={{ outline: 'none' }}
        />
        <Bar dataKey="attended" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BehaviorChart() {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(24, 9.8%, 83.7%)', 'hsl(60, 4.8%, 95.9%)'];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" hideLabel />}
            wrapperStyle={{ outline: 'none' }}
        />
        <Pie
            data={studentBehaviorData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            labelLine={false}
        >
          {studentBehaviorData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend
            iconType="circle"
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

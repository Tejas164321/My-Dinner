'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { attendanceData, studentBehaviorData } from '@/lib/data';

export function AttendanceChart() {
  const chartConfig = {
    attended: {
      label: 'Attended',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="attended" fill="var(--color-attended)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function BehaviorChart() {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
  
  const chartConfig = {
    value: {
        label: "Students"
    },
    'Regular Leaves': {
      label: 'Regular Leaves',
    },
    'Late Payments': {
      label: 'Late Payments',
    },
    'Meal Skips': {
      label: 'Meal Skips',
    },
    'Special Requests': {
      label: 'Special Requests',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
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
          <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
            iconType="circle"
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

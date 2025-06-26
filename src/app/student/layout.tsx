import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems, studentUser } from '@/lib/data';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout navItems={studentNavItems} user={studentUser}>
      {children}
    </DashboardLayout>
  );
}

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { adminNavItems, adminUser } from '@/lib/data';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout navItems={adminNavItems} user={adminUser}>
      {children}
    </DashboardLayout>
  );
}

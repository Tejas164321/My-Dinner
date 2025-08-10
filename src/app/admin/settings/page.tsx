

'use client';

import { AdminSettings } from '@/components/admin/admin-settings';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                 <div className="flex items-center gap-2">
                     <Button asChild variant="outline">
                         <Link href="/admin/support">
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            Support
                         </Link>
                     </Button>
                 </div>
            </div>
            <AdminSettings />
        </div>
    );
}

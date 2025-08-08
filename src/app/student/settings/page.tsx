
'use client';

import { StudentSettings } from "@/components/student/student-settings";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
           <StudentSettings />
        </div>
    );
}

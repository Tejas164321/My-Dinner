import { MenuSchedule } from '@/components/admin/menu-schedule';

export default function AdminMenuPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meal Menu Management</h1>
        <p className="text-muted-foreground">
          View and update the weekly meal schedule for the mess.
        </p>
      </div>
      <MenuSchedule />
    </div>
  );
}

import { MenuSchedule } from '@/components/admin/menu-schedule';

export default function AdminMenuPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Meal Menu Management</h1>
      </div>
      <MenuSchedule />
    </div>
  );
}

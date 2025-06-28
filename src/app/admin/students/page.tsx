import { StudentsTable } from '@/components/admin/students-table';

export default function AdminStudentsPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Approve new student requests and manage existing students.</p>
        </div>
      </div>
      <StudentsTable />
    </div>
  );
}

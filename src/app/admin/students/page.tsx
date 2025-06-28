import { StudentsTable } from '@/components/admin/students-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminStudentsPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Approve new student requests and manage existing students.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="october">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="october">October</SelectItem>
              <SelectItem value="september">September</SelectItem>
              <SelectItem value="august">August</SelectItem>
              <SelectItem value="july">July</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <StudentsTable />
    </div>
  );
}

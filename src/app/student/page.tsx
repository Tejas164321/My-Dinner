
import { redirect } from 'next/navigation';

export default function StudentRootPage() {
    redirect('/student/dashboard');
    return null;
}

    
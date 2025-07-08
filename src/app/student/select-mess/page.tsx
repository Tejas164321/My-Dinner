'use client';

import { useEffect, useState } from 'react';
import { getMesses } from '@/app/auth/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Mess {
    id: string;
    messName: string;
}

export default function SelectMessPage() {
    const [messes, setMesses] = useState<Mess[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMesses() {
            const fetchedMesses = await getMesses();
            setMesses(fetchedMesses);
            setLoading(false);
        }
        fetchMesses();
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
             <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <Card className="w-full max-w-2xl z-10 animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader className="text-center">
                    <CardTitle>Select Your Mess</CardTitle>
                    <CardDescription>Choose your mess facility from the list below to proceed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                            <Loader2 className="h-8 w-8 mb-4 animate-spin" />
                            <p>Loading available messes...</p>
                        </div>
                    ) : messes.length > 0 ? (
                        messes.map((mess) => (
                            <Link
                                key={mess.id}
                                href={`/student/join-mess?messId=${mess.id}&messName=${encodeURIComponent(mess.messName)}`}
                                className="block"
                            >
                                <Card className="hover:border-primary/80 hover:bg-secondary/50 transition-all">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Building2 className="h-6 w-6 text-primary" />
                                            <p className="font-semibold">{mess.messName}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No messes are currently registered.</p>
                            <p className="text-sm">Please check back later or contact an administrator.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}

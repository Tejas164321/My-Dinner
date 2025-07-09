'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, ChevronRight, Loader2, Hourglass, XCircle, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cancelJoinRequest } from '@/lib/actions/requests';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface Mess {
    id: string; // This will be the admin's UID
    messName: string;
}

function SelectMessComponent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [messes, setMesses] = useState<Mess[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, startTransition] = useTransition();

    const activeTab = searchParams.get('tab') || 'messes';

    useEffect(() => {
        async function fetchMesses() {
            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, 'messes'));
                const querySnapshot = await getDocs(q);
                const fetchedMesses = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    messName: doc.data().messName || 'Unnamed Mess',
                }));
                setMesses(fetchedMesses);
            } catch (err: any) {
                console.error("Error fetching messes:", err);
                setError("Could not load messes. Please check your connection.");
            } finally {
                setLoading(false);
            }
        }
        
        fetchMesses();
    }, []);

    const handleCancelRequest = () => {
        if (!user) return;
        startTransition(async () => {
            const result = await cancelJoinRequest(user.uid);
            if (result.success) {
                toast({ title: 'Request Cancelled', description: 'You can now join a different mess.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };
    
    const handleTabChange = (value: string) => {
        router.push(`/student/select-mess?tab=${value}`);
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
            <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <Card className="w-full max-w-2xl z-10 animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader className="text-center">
                    <CardTitle>Join a Mess</CardTitle>
                    <CardDescription>Select a mess to join or check the status of your existing request.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="messes">All Messes</TabsTrigger>
                            <TabsTrigger value="requests">My Requests</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="messes" className="mt-4 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                    <Loader2 className="h-8 w-8 mb-4 animate-spin" />
                                    <p>Loading available messes...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-destructive py-8"><p>{error}</p></div>
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
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="requests" className="mt-4">
                            {user?.status === 'pending_approval' ? (
                                <Card className="bg-secondary/50">
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <Hourglass className="h-8 w-8 text-amber-500" />
                                            <div>
                                                <p className="font-semibold">{user.messName || 'Awaiting Details...'}</p>
                                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                                                    Pending Approval
                                                </Badge>
                                            </div>
                                        </div>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" disabled={isCancelling}>
                                                    {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                                    Cancel Request
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will cancel your join request for "{user.messName}". You will have to re-apply if you change your mind.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleCancelRequest}>
                                                    Yes, Cancel
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                    <FileQuestion className="h-10 w-10 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground">No Pending Requests</h3>
                                    <p>You haven't applied to any mess yet.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );
}


export default function SelectMessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SelectMessComponent />
        </Suspense>
    );
}

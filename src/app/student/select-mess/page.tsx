

'use client';

import { useEffect, useState, useTransition, Suspense, type MouseEvent, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs, doc, updateDoc, writeBatch, deleteDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, ChevronRight, Loader2, Hourglass, XCircle, FileQuestion, LogOut, RefreshCw, Trash2, ShieldX, History, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
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
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { leaveMessAction } from '@/lib/actions/user';
import { Input } from '@/components/ui/input';
import type { Student } from '@/lib/data';


interface Mess {
    id: string; // This will be the admin's UID
    messName: string;
}

// Client-side action
async function reapplyToMess(userId: string, messId: string, messName: string): Promise<{ success: boolean; error?: string }> {
    if (!userId || !messId || !messName) return { success: false, error: 'User or mess information is missing.' };
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { 
            status: 'pending_approval',
            messId,
            messName,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error reapplying to mess:", error);
        return { success: false, error: 'Failed to re-apply.' };
    }
}


function SelectMessComponent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [messes, setMesses] = useState<Mess[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCancelling, startCancelTransition] = useTransition();
    const [isReapplying, startReapplyTransition] = useTransition();

    const activeTab = searchParams.get('tab') || (user?.status === 'rejected' || user?.status === 'pending_approval' || user?.status === 'suspended' || user?.status === 'left' ? 'requests' : 'messes');

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

    const filteredMesses = useMemo(() => {
        if (!searchQuery) return messes;
        return messes.filter(mess => mess.messName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [messes, searchQuery]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleClearRequest = () => {
        if (!user) return;
        startCancelTransition(async () => {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                status: 'unaffiliated',
                messId: null,
                messName: null,
            });
            toast({ title: 'Request Cleared', description: 'You can now join a different mess.' });
        });
    };
    
     const handleReapply = () => {
        if (!user || !user.messId || !user.messName) return;
        startReapplyTransition(async () => {
            const result = await reapplyToMess(user.uid, user.messId!, user.messName!);
            if (result.success) {
                toast({ title: 'Re-applied Successfully', description: 'Your request has been sent to the admin for approval again.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    const handleTabChange = (value: string) => {
        router.push(`/student/select-mess?tab=${value}`);
    };
    
    const handleMessClick = (e: MouseEvent<HTMLAnchorElement>, mess: Mess) => {
        if (user?.status === 'pending_approval' || user?.status === 'rejected' || user?.status === 'suspended' || user?.status === 'left') {
            e.preventDefault();
            toast({
                variant: 'destructive',
                title: 'Action Required',
                description: 'Please resolve your current request status before applying to another mess.',
            });
        }
    };

    const renderRequestStatus = () => {
        if (authLoading) {
            return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }

        if (user?.status === 'pending_approval') {
            return (
                <Card className="bg-secondary/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Hourglass className="h-8 w-8 text-amber-500 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{user.messName || 'Awaiting Details...'}</p>
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                                    Pending Approval
                                </Badge>
                            </div>
                        </div>
                         <Button variant="destructive" disabled={isCancelling} onClick={handleClearRequest}>
                            {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Cancel Request
                        </Button>
                    </CardContent>
                </Card>
            );
        } else if (user?.status === 'rejected') {
             return (
                <Card className="bg-secondary/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Request to join {user.messName || 'a mess'} was rejected.</p>
                                <Badge variant="destructive">
                                    Request Rejected
                                </Badge>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             <Button size="sm" disabled={isReapplying} onClick={handleReapply}>
                                {isReapplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Re-request
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9 hover:bg-muted">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear Rejected Request?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove this rejected request from your view. You will be able to apply to other messes.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearRequest} disabled={isCancelling}>
                                            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            );
        } else if (user?.status === 'suspended') {
             return (
                <Card className="bg-secondary/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <ShieldX className="h-8 w-8 text-destructive flex-shrink-0" />
                            <div>
                                <p className="font-semibold">
                                    Suspended from <span className="text-primary">{user.messName}</span>
                                </p>
                                 <Badge variant="destructive">Suspended</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
             );
        } else if (user?.status === 'left') {
             return (
                <Card className="bg-secondary/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <History className="h-8 w-8 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-semibold">
                                    You have left <span className="text-primary">{user.messName}</span>
                                </p>
                                 <Badge variant="outline">Left Mess</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
             );
        } else {
            return (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                    <FileQuestion className="h-10 w-10 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No Pending Requests</h3>
                    <p>You haven't applied to any mess yet. Select one from the "All Messes" tab.</p>
                </div>
            )
        }
    };

    return (
        <Card className="w-full max-w-2xl z-10 animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader className="text-center relative">
                <CardTitle>Join a Mess</CardTitle>
                <CardDescription>Select a mess to join or check the status of your existing request.</CardDescription>
                <Button variant="ghost" className="absolute top-2 right-2 h-9 px-3" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="messes">All Messes</TabsTrigger>
                        <TabsTrigger value="requests">My Requests</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="messes" className="mt-4">
                        <div className="space-y-4 h-[400px] flex flex-col">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search for a mess..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <ScrollArea className="flex-grow pr-4">
                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                            <Loader2 className="h-8 w-8 mb-4 animate-spin" />
                                            <p>Loading available messes...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center text-destructive py-8"><p>{error}</p></div>
                                    ) : filteredMesses.length > 0 ? (
                                        filteredMesses.map((mess) => (
                                            <a
                                                key={mess.id}
                                                href={`/student/join-mess?messId=${mess.id}&messName=${encodeURIComponent(mess.messName)}`}
                                                onClick={(e) => handleMessClick(e, mess)}
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
                                            </a>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>No messes found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="requests" className="mt-4">
                         <div className="h-[400px]">
                            {renderRequestStatus()}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}


export default function SelectMessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
                <SelectMessComponent />
            </Suspense>
        </main>
    );
}


    
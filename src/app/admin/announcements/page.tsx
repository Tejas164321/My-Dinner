
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Megaphone, Trash2, History, Loader2 } from 'lucide-react';
import type { Announcement } from '@/lib/data';
import { onAnnouncementsUpdate } from '@/lib/listeners/announcements';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
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
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function AnnouncementsPage() {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!adminUser) return;
        setIsLoading(true);
        const unsubscribe = onAnnouncementsUpdate(adminUser.uid, (updatedAnnouncements) => {
            setAnnouncements(updatedAnnouncements);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [adminUser]);

    const handleSendAnnouncement = async () => {
        if (!title || !message || !adminUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title and message cannot be empty.' });
            return;
        }

        setIsSending(true);
        try {
            await addDoc(collection(db, 'announcements'), {
                title,
                message,
                messId: adminUser.uid,
                date: new Date().toISOString(),
            });

            toast({ title: 'Success', description: 'Announcement has been sent.' });
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error("Error sending announcement:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send announcement.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'announcements', id));
            toast({ title: 'Announcement Deleted' });
        } catch (error) {
            console.error("Error deleting announcement:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete announcement.' });
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="hidden md:block">
                <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 flex flex-col">
                     <Card>
                        <CardHeader>
                            <CardTitle>Create New Announcement</CardTitle>
                            <CardDescription>This message will be sent to all students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ann-title">Title</Label>
                                <Input 
                                    id="ann-title" 
                                    placeholder="e.g., Special Dinner Menu" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isSending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ann-message">Message</Label>
                                <Textarea 
                                    id="ann-message" 
                                    placeholder="Type your announcement here..." 
                                    className="min-h-[120px]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={isSending}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSendAnnouncement} className="w-full" disabled={isSending}>
                                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
                                {isSending ? 'Sending...' : 'Send Announcement'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-3 flex flex-col">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                             <div className="flex items-center gap-3">
                                <History className="h-6 w-6 text-primary"/>
                                <div>
                                    <CardTitle>Past Announcements</CardTitle>
                                    <CardDescription>A log of all announcements sent.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-2 pt-0">
                            <ScrollArea className="h-96">
                                <div className="p-4 pt-0 space-y-4">
                                    {isLoading ? (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : announcements.length > 0 ? (
                                        announcements.map((ann) => (
                                            <div key={ann.id} className="p-4 bg-secondary/50 rounded-lg relative group">
                                                <div className="flex items-start gap-4">
                                                     <div className="bg-primary/10 p-2.5 rounded-full mt-1">
                                                        <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-base">{ann.title}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">{ann.message}</p>
                                                        <p className="text-xs text-muted-foreground/70 mt-3">{format(new Date(ann.date), 'MMMM do, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the announcement titled "{ann.title}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(ann.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                            <p>No announcements sent yet.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

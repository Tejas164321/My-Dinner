'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Megaphone, Trash2, History } from 'lucide-react';
import { pastAnnouncements as initialAnnouncements, Announcement } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export default function AnnouncementsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

    const handleSendAnnouncement = () => {
        if (!title || !message) return;

        const newAnnouncement: Announcement = {
            id: new Date().toISOString(),
            title,
            message,
            date: format(new Date(), 'yyyy-MM-dd'),
        };

        setAnnouncements([newAnnouncement, ...announcements]);
        setTitle('');
        setMessage('');
    };

    const handleDelete = (id: string) => {
        setAnnouncements(announcements.filter(ann => ann.id !== id));
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                <p className="text-muted-foreground">Broadcast messages and important updates to all students.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
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
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSendAnnouncement} className="w-full">
                                <Megaphone className="mr-2 h-4 w-4" />
                                Send Announcement
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
                                    {announcements.length > 0 ? (
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDelete(ann.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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

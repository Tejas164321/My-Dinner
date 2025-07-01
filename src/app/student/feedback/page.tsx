
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentFeedbackPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
             <div>
                <h1 className="text-2xl font-bold tracking-tight">Feedback & Support</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-primary"/>
                        <div>
                            <CardTitle>Submit Your Feedback</CardTitle>
                            <CardDescription>
                                We value your opinion. Let us know how we can improve.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 max-w-2xl mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="feedback">General Feedback</SelectItem>
                                <SelectItem value="suggestion">Suggestion for Menu</SelectItem>
                                <SelectItem value="complaint">Complaint</SelectItem>
                                <SelectItem value="issue">Report an Issue</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Food Quality, Staff Behavior, etc." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Please describe your feedback in detail..." className="min-h-[150px]" />
                    </div>
                    <Button className="w-full">
                        <Send className="mr-2" /> Submit Feedback
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


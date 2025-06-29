
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Mail, Phone } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Support</h1>
                <p className="text-muted-foreground">Get help and share your feedback with us.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Reach out to us directly for urgent matters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Email</span>
                                    <a href="mailto:support@messomate.com" className="text-sm text-primary hover:underline">
                                        support@messomate.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Phone</span>
                                    <a href="tel:+911234567890" className="text-sm text-primary hover:underline">
                                        +91 123 456 7890
                                    </a>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Business Hours</span>
                                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am - 6pm IST</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit a Request</CardTitle>
                            <CardDescription>
                                Have an issue, a query, or some feedback? Let us know by filling out the form below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Your Email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Issue with billing" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Please describe your issue or feedback in detail..." className="min-h-[150px]" />
                            </div>
                            <Button className="w-full">Submit Request</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

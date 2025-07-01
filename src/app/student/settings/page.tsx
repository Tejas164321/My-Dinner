
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { studentUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, KeyRound } from 'lucide-react';

export default function StudentSettingsPage() {
    const { toast } = useToast();

    // Profile Settings State
    const [name, setName] = useState(studentUser.name);
    const [email, setEmail] = useState(studentUser.email);
    const [contact, setContact] = useState('+91 98765 43210');

    const handleSaveChanges = () => {
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                     <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                             <Avatar className="w-28 h-28 border-4 border-primary/20 mb-4">
                                <AvatarImage src={studentUser.avatarUrl} alt={studentUser.name} />
                                <AvatarFallback className="text-4xl">{studentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{name}</h2>
                            <p className="text-muted-foreground">{studentUser.role}</p>
                            <Button variant="outline" className="mt-4">Change Picture</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <User className="h-6 w-6 text-primary"/>
                                <div>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-name">Full Name</Label>
                                    <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profile-contact">Contact Number</Label>
                                    <Input id="profile-contact" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="profile-email">Email Address</Label>
                                    <Input id="profile-email" type="email" value={email} readOnly disabled />
                                    <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardFooter>
                    </Card>

                     <Card className="mt-8">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <KeyRound className="h-6 w-6 text-primary"/>
                                <div>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>For security, choose a strong new password.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" placeholder="••••••••" />
                                </div>
                                <div></div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" placeholder="••••••••" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button>Update Password</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

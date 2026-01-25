'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LifeBuoy, FileText, MessageSquare, Mail, HelpCircle, Ticket, Send } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mockTickets = [
    { id: 'TICKET-001', subject: 'Fare Dispute on Ride #R123', status: 'pending', updated: '2 hours ago' },
    { id: 'TICKET-002', subject: 'Lost item: Black Wallet', status: 'closed', updated: '1 day ago' },
];

export default function HelpCenterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [issueDescription, setIssueDescription] = useState('');

    const handleSubmitTicket = () => {
        if (!issueType || !issueDescription) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select an issue type and provide a description.',
            });
            return;
        }
        toast({
            title: "Ticket Submitted",
            description: "Your support ticket has been created. Our team will get back to you shortly.",
        });
        setIsReportDialogOpen(false);
        setIssueType('');
        setIssueDescription('');
    };

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-3xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push('/profile/safety')} className="-ml-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Safety & Support
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">Help Center</h1>
                    
                    <div className="grid gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><LifeBuoy /> How can we help?</CardTitle>
                                <CardDescription>Select an option below to get started.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-4">
                                <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="lg" className="h-auto py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <Ticket className="h-8 w-8" />
                                                <span className="font-bold">Raise a Ticket</span>
                                                <span className="text-xs font-normal text-muted-foreground text-center">For any ride-related issue or complaint.</span>
                                            </div>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <DialogHeader>
                                            <DialogTitle>Create a Support Ticket</DialogTitle>
                                            <DialogDescription>
                                                Provide details about your issue, and our team will investigate.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="issue-type">Topic</Label>
                                                <Select onValueChange={setIssueType}>
                                                    <SelectTrigger id="issue-type">
                                                        <SelectValue placeholder="Select a topic" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ride-issue">Ride Issue (Safety, Driver, etc.)</SelectItem>
                                                        <SelectItem value="payment-issue">Payment & Fare Issue</SelectItem>
                                                        <SelectItem value="account-issue">Account Problem</SelectItem>
                                                        <SelectItem value="app-feedback">App Feedback</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="issue-description">Description</Label>
                                                <Textarea
                                                    id="issue-description"
                                                    placeholder="Please provide as much detail as possible, including Ride ID if applicable."
                                                    value={issueDescription}
                                                    onChange={(e) => setIssueDescription(e.target.value)}
                                                    rows={5}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" onClick={handleSubmitTicket} disabled={!issueType || !issueDescription}>
                                                <Send className="mr-2 h-4 w-4"/>
                                                Submit Ticket
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" size="lg" className="h-auto py-4" onClick={() => router.push('/profile/faq')}>
                                    <div className="flex flex-col items-center gap-2">
                                        <HelpCircle className="h-8 w-8" />
                                        <span className="font-bold">Read FAQs</span>
                                        <span className="text-xs font-normal text-muted-foreground text-center">Find answers to common questions.</span>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>My Support Tickets</CardTitle>
                                <CardDescription>Track the status of your submitted tickets.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {mockTickets.length > 0 ? (
                                    <div className="space-y-4">
                                        {mockTickets.map((ticket) => (
                                            <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{ticket.subject}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {ticket.id} &bull; Last updated: {ticket.updated}</p>
                                                </div>
                                                <Badge variant={ticket.status === 'closed' ? 'secondary' : 'default'}>{ticket.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        You have no open support tickets.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Us Directly</CardTitle>
                                <CardDescription>For when you need to speak with a human.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-4">
                                <Button asChild variant="outline" className="h-auto py-3 justify-start">
                                    <a href="mailto:royadityaa003@gmail.com">
                                        <Mail className="mr-4" />
                                        <div>
                                            <p className="font-semibold">Email Support</p>
                                            <p className="text-xs text-muted-foreground">royadityaa003@gmail.com</p>
                                        </div>
                                    </a>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 justify-start" onClick={() => toast({ title: 'Feature Coming Soon', description: 'Live chat will be available in a future update.'})}>
                                    <MessageSquare className="mr-4" />
                                    <div>
                                        <p className="font-semibold">Live Chat</p>
                                        <p className="text-xs text-muted-foreground">Chat with an agent now.</p>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

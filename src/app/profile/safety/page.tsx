'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertCircle, Share2, HelpCircle, MessageSquare, Mail, ShieldCheck, BookOpenCheck } from 'lucide-react';

export default function SafetyPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleNotImplemented = (feature: string) => {
        toast({
          title: "Feature coming soon!",
          description: `${feature} is not yet available.`
        })
    }

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push('/profile')} className="-ml-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Profile
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">Safety &amp; Support</h1>

                    <div className="space-y-8">
                        {/* Emergency Assistance */}
                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> Emergency Assistance</CardTitle>
                                <CardDescription>For use in urgent situations during a ride.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button variant="destructive" size="lg" className="h-auto py-3" onClick={() => handleNotImplemented('Emergency SOS')}>
                                    <div className="flex flex-col items-center gap-1">
                                        <AlertCircle className="h-6 w-6" />
                                        <span className="font-bold">SOS Helpline</span>
                                        <span className="text-xs font-normal">Contact emergency services</span>
                                    </div>
                                </Button>
                                <Button variant="outline" size="lg" className="h-auto py-3" onClick={() => handleNotImplemented('Share Trip')}>
                                    <div className="flex flex-col items-center gap-1">
                                        <Share2 className="h-6 w-6" />
                                        <span className="font-bold">Share Trip</span>
                                        <span className="text-xs font-normal">Send live location to contacts</span>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Help Center */}
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><HelpCircle /> Help Center</CardTitle>
                                <CardDescription>Find answers or get in touch with our support team.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" onClick={() => handleNotImplemented('FAQs')}><HelpCircle className="mr-2"/> Read FAQs</Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => handleNotImplemented('Contact Support')}><Mail className="mr-2"/> Contact Support</Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => handleNotImplemented('Live Chat')}><MessageSquare className="mr-2"/> Live Chat with Agent</Button>
                            </CardContent>
                        </Card>
                        
                        {/* Insurance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Ride Insurance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">All rides are insured in partnership with leading insurance providers. This covers accidents and emergencies during your trip, providing you and your loved ones with peace of mind. <a href="#" className="underline text-primary" onClick={(e) => {e.preventDefault(); handleNotImplemented('Insurance Details')}}>Learn more</a>.</p>
                            </CardContent>
                        </Card>
                        
                         {/* Safety Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><BookOpenCheck /> Safety Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                               <li>Verify your driver and car details before starting the trip.</li>
                               <li>Always wear your seatbelt.</li>
                               <li>Avoid sharing personal information with the driver.</li>
                               <li>Use the "Share Trip" feature to let friends or family know your whereabouts.</li>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

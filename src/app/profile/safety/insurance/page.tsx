'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck, FileText, DollarSign, LifeBuoy } from 'lucide-react';

export default function InsuranceDetailsPage() {
    const router = useRouter();

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
                    <h1 className="font-headline text-3xl font-bold mb-6">Ride Insurance Details</h1>
                    
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle>Your Protection on Every Ride</CardTitle>
                                    <CardDescription>All MithilaCab rides are insured for your peace of mind.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground">
                                We've partnered with a leading national insurance provider to offer comprehensive coverage from the moment your ride begins until it ends. This policy is provided at no extra cost to you.
                            </p>
                            
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-accent" /> Coverage Details</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        <li>Accidental Medical Expense: Up to ₹5,00,000</li>
                                        <li>Permanent Disability: Up to ₹5,00,000</li>
                                        <li>Accidental Death: Up to ₹5,00,000</li>
                                        <li>Baggage Loss/Damage: Up to ₹10,000</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-accent" /> Zero Cost to You</h4>
                                    <p className="text-sm text-muted-foreground">
                                        This insurance coverage is automatically applied to every ride you take with MithilaCab. There are no hidden fees or charges for this protection.
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><LifeBuoy className="h-5 w-5 text-accent" /> How to Make a Claim</h4>
                                <p className="text-sm text-muted-foreground">
                                    In the unfortunate event of an incident during your ride, please contact our 24/7 support team immediately through the app's Help Center. We will guide you through the claim process and provide all necessary assistance.
                                </p>
                            </div>
                            
                             <p className="text-xs text-muted-foreground pt-4 border-t">
                                *Terms and conditions apply. Coverage details are subject to the policy issued by our insurance partner. This is a summary and not the full policy document.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}


'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    const router = useRouter();

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-3xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">Terms of Service</h1>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>MithilaCab Terms of Service</CardTitle>
                            <CardDescription>Last updated: July 29, 2024</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>Welcome to MithilaCab!</p>
                            <p>This is a placeholder for the Terms of Service. In a real application, this page would contain the legal terms and conditions for using the service. This would include details on user responsibilities, payment terms, liability limitations, and more.</p>
                            <p>Generating comprehensive legal documents is beyond the scope of this AI assistant. It is highly recommended to consult with a legal professional to draft your official Terms of Service.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

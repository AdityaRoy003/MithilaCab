
'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
                    <h1 className="font-headline text-3xl font-bold mb-6">Privacy Policy</h1>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>MithilaCab Privacy Policy</CardTitle>
                            <CardDescription>Last updated: July 29, 2024</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                           <p>Welcome to MithilaCab!</p>
                           <p>This is a placeholder for the Privacy Policy. A real privacy policy would detail what user data is collected (e.g., location, personal information, payment details), how it's used, with whom it's shared, and how it's protected.</p>
                           <p>Generating a legally compliant Privacy Policy requires careful consideration of data protection laws (like GDPR, CCPA, etc.) and is beyond the scope of this AI assistant. Please consult with a legal professional to ensure your policy is complete and compliant.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

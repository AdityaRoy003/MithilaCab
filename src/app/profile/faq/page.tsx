'use client';

import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft } from 'lucide-react';

const faqs = [
    {
        question: "How do I book a ride with MithilaCab?",
        answer: "You can book a ride easily through our app. Just enter your destination in the 'Where to?' box on the home screen, choose your preferred ride type, and confirm your booking. We'll find a nearby driver for you instantly."
    },
    {
        question: "What are your service areas in Mithilanchal?",
        answer: "We currently operate in major cities and towns across the Mithilanchal region, including Darbhanga, Madhubani, Samastipur, and surrounding areas. We are continuously expanding our service network."
    },
    {
        question: "How is the fare calculated?",
        answer: "Our fares are calculated based on a base rate plus charges for the distance and duration of the ride. You will always see an estimated fare before you confirm your booking. Surge pricing may apply during peak hours."
    },
    {
        question: "What safety measures do you have in place?",
        answer: "Your safety is our top priority. All our drivers are verified, you can track your ride in real-time, share your journey with loved ones, and access our 24/7 support team through the app."
    },
    {
        question: "Can I schedule a ride in advance?",
        answer: "Yes! Our app allows you to schedule a ride for a later time or date. Simply select the 'Schedule' option when booking and choose your desired pickup time."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept a variety of payment methods, including credit/debit cards, UPI, and popular digital wallets. You can also pay with cash. You can manage your payment options in the 'Payment' section of the app."
    }
];

export default function FaqPage() {
    const router = useRouter();

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-muted/20">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push('/profile/safety')} className="-ml-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Safety & Support
                        </Button>
                    </div>
                    <h1 className="font-headline text-3xl font-bold mb-6">Frequently Asked Questions</h1>
                    <Card>
                        <CardContent className="p-6">
                             <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                                        <AccordionContent className="text-base text-muted-foreground">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

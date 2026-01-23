'use client';

import { motion } from 'framer-motion';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, BookOpen, Shield, IndianRupee, Star, Video, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.3 } },
};

const trainingModules = [
    {
        icon: BookOpen,
        title: "Welcome to MithilaCab: Your First Ride",
        description: "Everything you need to know to get started and complete your first trip successfully.",
        content: [
            { type: Video, text: "Video: A Driver's First Day" },
            { type: FileText, text: "Guide: Setting Up Your Profile and Vehicle" },
            { type: FileText, text: "Checklist: Pre-Ride Vehicle Inspection" },
        ]
    },
    {
        icon: Shield,
        title: "Safety and Professionalism on the Road",
        description: "Our commitment to safety and providing a 5-star experience for every passenger.",
        content: [
            { type: Video, text: "Video: Handling Common On-Road Scenarios" },
            { type: FileText, text: "Guide: Our Community Guidelines & Policies" },
            { type: FileText, text: "Guide: Using In-App Safety Features" },
        ]
    },
    {
        icon: IndianRupee,
        title: "Maximizing Your Earnings",
        description: "Learn strategies to boost your income, understand earnings, and take advantage of incentives.",
        content: [
            { type: Video, text: "Video: Understanding Surge and Peak Hours" },
            { type: FileText, text: "Guide: Decoding Your Earnings Statement" },
            { type: FileText, text: "Guide: How to Qualify for Weekly Incentives" },
        ]
    },
    {
        icon: Star,
        title: "Embracing Mithila's Culture",
        description: "Providing a unique, culturally-aware experience for tourists and locals alike.",
        content: [
            { type: Video, text: "Video: Key Landmarks in Darbhanga & Madhubani" },
            { type: FileText, text: "Guide: Common Phrases in Maithili" },
            { type: FileText, text: "Guide: Local Etiquette and Customer Service" },
        ]
    }
];

export default function DriverTrainingPage() {
  const router = useRouter();

  return (
    <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft />
                </Button>
                <h1 className="font-headline text-3xl font-bold">Training Modules</h1>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
            >
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to the Training Center</CardTitle>
                            <CardDescription>Sharpen your skills and learn how to make the most of the MithilaCab platform. Complete modules to improve your service and earnings.</CardDescription>
                        </CardHeader>
                    </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                     <Accordion type="single" collapsible className="w-full">
                        {trainingModules.map((module, index) => (
                             <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-muted rounded-full">
                                            <module.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-left">{module.title}</h3>
                                            <p className="text-sm text-muted-foreground text-left">{module.description}</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pl-16 space-y-3 pt-2">
                                        {module.content.map((item, cIndex) => (
                                            <div key={cIndex} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                                <item.type className="h-4 w-4" />
                                                <span>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </motion.div>
        </main>
    </AppLayout>
  );
}

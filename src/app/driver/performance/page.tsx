'use client';

import { motion } from 'framer-motion';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle, XCircle, ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';


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

// Mock data for recent feedback
const recentFeedback = [
    { id: 'f1', rating: 5, comment: 'Very professional and polite driver. The car was clean and the ride was smooth. Highly recommended!', date: '2024-07-28' },
    { id: 'f2', rating: 4, comment: 'Good driver, got me to my destination on time. Could have been a bit more communicative.', date: '2024-07-27' },
    { id: 'f3', rating: 5, comment: 'Excellent service! Helped with my luggage and was very friendly.', date: '2024-07-26' },
];


export default function DriverPerformancePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
        title: "Feature coming soon!",
        description: "Dispute resolution will be available in a future update."
    });
  }

  return (
    <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft />
                </Button>
                <h1 className="font-headline text-3xl font-bold">Performance & Ratings</h1>
            </div>

             {/* Overview Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
            >
                <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Overall Rating</CardTitle>
                             <CardDescription>Based on your last 50 rides.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2">
                                <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
                                <span className="text-5xl font-bold">4.8</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Excellent</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Acceptance Rate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">92%</div>
                            <p className="text-xs text-muted-foreground">
                                46 of the last 50 ride requests accepted.
                            </p>
                            <Progress value={92} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4%</div>
                            <p className="text-xs text-muted-foreground">
                                2 cancellations in the last 50 rides.
                            </p>
                            <Progress value={4} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Recent Feedback */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare /> Recent Passenger Feedback</CardTitle>
                        <CardDescription>Here's what your passengers are saying about their rides.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {recentFeedback.map(feedback => (
                             <div key={feedback.id} className="flex gap-4">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-lg">{feedback.rating}</span>
                                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex-1 border-l pl-4">
                                    <p className="text-sm text-foreground">{feedback.comment}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{feedback.date}</p>
                                </div>
                            </div>
                        ))}
                         {recentFeedback.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No feedback yet.</p>
                         )}
                    </CardContent>
                </Card>
            </motion.div>
            
            {/* Dispute a Rating */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert /> Dispute a Rating</CardTitle>
                        <CardDescription>If you believe a rating is unfair, you can submit it for review by our support team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Please provide the ride details and a reason for the dispute. Our team will investigate and take appropriate action. We aim to respond within 48 hours.</p>
                        <Button onClick={handleNotImplemented}>
                            Submit a Dispute
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    </AppLayout>
  );
}

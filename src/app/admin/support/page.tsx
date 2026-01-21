'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Flag, MessageSquare, Archive } from 'lucide-react';

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


export default function SupportPage() {
  return (
    <div className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h1 className="font-headline text-3xl font-bold mb-4">Support & Safety</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert /> Complaint Resolution Center</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">View and respond to user and driver-reported issues.</p>
                        <div className="mt-4 h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Ticket queue coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Flag /> Emergency Ride Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Review rides that were flagged for safety emergencies.</p>
                         <div className="mt-4 h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Emergency alert feed coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare /> Live Chat Monitor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Oversee ongoing support conversations in real time.</p>
                         <div className="mt-4 h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Live chat dashboard coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
             <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Archive /> Incident Report Archive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Search and review past safety-related cases and reports.</p>
                         <div className="mt-4 h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Report archive coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

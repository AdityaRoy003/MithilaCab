'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { ComplaintCenter } from './complaint-center';
import { EmergencyFlagsList } from './emergency-flags';


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
        
        <div className="grid gap-8 lg:grid-cols-1">
            <motion.div variants={itemVariants}>
                <ComplaintCenter />
            </motion.div>
            <motion.div variants={itemVariants}>
                <EmergencyFlagsList />
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare /> Live Chat Monitor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Oversee ongoing support conversations in real time.</p>
                         <div className="mt-4 h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>A full live chat system is a complex feature that will be available in a future update.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

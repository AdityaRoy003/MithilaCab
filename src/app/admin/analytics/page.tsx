'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, TrendingUp, Filter, Repeat } from 'lucide-react';

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


export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h1 className="font-headline text-3xl font-bold mb-4">Analytics & Reporting</h1>
        <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><FileDown /> Custom Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Export CSV/PDF of rides, users, and earnings data.</p>
                         <Button variant="outline" className="mt-4 w-full">Generate Report</Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><TrendingUp /> Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Compare growth metrics over weeks or months.</p>
                        <Button variant="outline" className="mt-4 w-full">View Trends</Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Filter /> Driver Onboarding Funnel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Track conversion from signup to first ride.</p>
                        <Button variant="outline" className="mt-4 w-full">Analyze Funnel</Button>
                    </CardContent>
                </Card>
            </motion.div>
             <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Repeat /> User Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Monitor repeat ride behavior and user loyalty.</p>
                        <Button variant="outline" className="mt-4 w-full">View Dashboard</Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

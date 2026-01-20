'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CarFront, Activity, IndianRupee } from 'lucide-react';

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


export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rides
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Drivers
              </CardTitle>
              <CarFront className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+184</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,245</div>
              <p className="text-xs text-muted-foreground">
                +15.2% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Rides</CardTitle>
                    <CardDescription>A list of the most recent rides across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Recent rides table coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>A breakdown of revenue over the last month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Revenue chart coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

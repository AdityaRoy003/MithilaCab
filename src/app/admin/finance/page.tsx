'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, Clock, Zap, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// Mock data for the chart
const weeklyData = [
  { name: 'Mon', revenue: 4000, commission: 800 },
  { name: 'Tue', revenue: 3000, commission: 600 },
  { name: 'Wed', revenue: 5000, commission: 1000 },
  { name: 'Thu', revenue: 4500, commission: 900 },
  { name: 'Fri', revenue: 6000, commission: 1200 },
  { name: 'Sat', revenue: 7500, commission: 1500 },
  { name: 'Sun', revenue: 8000, commission: 1600 },
];

// Mock data for payouts
const payouts = [
    { id: 'p1', driver: 'Ramesh Kumar', amount: 3250.75, date: '2024-07-28', status: 'Completed' },
    { id: 'p2', driver: 'Sita Devi', amount: 2890.50, date: '2024-07-28', status: 'Completed' },
    { id: 'p3', driver: 'Amit Singh', amount: 4120.00, date: '2024-08-05', status: 'Pending' },
    { id: 'p4', driver: 'Priya Sharma', amount: 3500.00, date: '2024-08-05', status: 'Pending' },
];

export default function FinancePage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold">Finance & Payouts</h1>
      </div>

      {/* Overview Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12,450.20</div>
              <p className="text-xs text-muted-foreground">
                +15.2% from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payouts
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹7,620.00</div>
              <p className="text-xs text-muted-foreground">
                for 2 drivers
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incentives</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Programs</div>
              <p className="text-xs text-muted-foreground">
                e.g., Peak hour bonus
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:gap-8 lg:grid-cols-5"
      >
        {/* Weekly Report Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Report</CardTitle>
              <CardDescription>Total revenue and platform commission over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
               <ResponsiveContainer>
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                         />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Total Revenue" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="commission" fill="hsl(var(--secondary))" name="Commission" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payouts Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Payouts</CardTitle>
                        <CardDescription>Track pending and completed payouts.</CardDescription>
                    </div>
                    <Button size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Driver</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payouts.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell>
                                        <div className="font-medium">{payout.driver}</div>
                                        <div className="text-xs text-muted-foreground">{payout.date}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">₹{payout.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={payout.status === 'Completed' ? 'default' : 'outline'}>{payout.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>
      
      {/* Incentives Section */}
      <motion.div variants={itemVariants}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Incentives & Bonuses</CardTitle>
                    <CardDescription>Manage special earnings programs for drivers.</CardDescription>
                </div>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Create Incentive</Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekend Warrior</CardTitle>
                        <CardDescription>Complete 20 rides on Sat/Sun</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold text-primary">Bonus: ₹500</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Night Owl</CardTitle>
                        <CardDescription>Drive 5 rides after 11 PM</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold text-primary">Bonus: ₹250</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                     <CardHeader>
                        <CardTitle className="text-lg">High Rated</CardTitle>
                        <CardDescription>Maintain 4.9+ rating for a week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold text-primary">Bonus: 1% of earnings</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}

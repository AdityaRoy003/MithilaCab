'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Refund } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

function RefundTable({ refunds, isLoading, title }: { refunds: Refund[] | null, isLoading: boolean, title: string }) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    if (!refunds || refunds.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>No {title.toLowerCase()} complaints.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead className="hidden md:table-cell">Reason</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Fare</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {refunds.map(refund => (
                    <TableRow key={refund.id}>
                        <TableCell>
                            <div className="font-medium">{refund.userName}</div>
                            <div className="text-xs text-muted-foreground">{refund.rideDate ? format(refund.rideDate.toDate(), "PPP") : 'N/A'}</div>
                        </TableCell>
                         <TableCell>
                             <Badge variant="outline">{refund.issueType}</Badge>
                         </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">{refund.reason}</TableCell>
                        <TableCell className="hidden sm:table-cell text-right font-mono">₹{refund.fareAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${refund.userId}`)}>View User</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export function ComplaintCenter() {
  const firestore = useFirestore();

  const refundsQuery = useMemoFirebase(() => query(collection(firestore, 'refunds'), orderBy('requestedAt', 'desc')), [firestore]);
  const { data: allRefunds, isLoading } = useCollection<Refund>(refundsQuery);

  const pendingRefunds = allRefunds?.filter(r => r.status === 'pending');
  const processedRefunds = allRefunds?.filter(r => r.status !== 'pending');

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert /> Complaint Resolution Center</CardTitle>
            <CardDescription>View and respond to user and driver-reported issues. Financial actions (approve/deny) are handled in the Finance tab.</CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">Pending ({pendingRefunds?.length ?? 0})</TabsTrigger>
                    <TabsTrigger value="processed">Archive ({processedRefunds?.length ?? 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <RefundTable refunds={pendingRefunds ?? null} isLoading={isLoading} title="Pending" />
                </TabsContent>
                <TabsContent value="processed">
                    <RefundTable refunds={processedRefunds ?? null} isLoading={isLoading} title="Processed" />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}

'use client';

import { useState } from "react";
import type { Ride } from "@/lib/data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { IndianRupee, Star, RefreshCw, Download, Flag, Eye } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RideReceipt } from "./ride-receipt";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface RideHistoryCardProps {
  ride: Ride;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  completed: 'default',
  cancelled: 'destructive',
  requested: 'outline',
  accepted: 'outline',
  'in-progress': 'outline',
}

export function RideHistoryCard({ ride }: RideHistoryCardProps) {
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  const getFormattedDate = (date: any) => {
    if (!date) return 'N/A';
    try {
        if (date instanceof Timestamp) {
            return format(date.toDate(), "PPP p");
        }
        const d = new Date(date);
        if(!isNaN(d.getTime())) return format(d, "PPP p");
        return 'Invalid Date';
    } catch (e) {
        return 'Invalid Date';
    }
  }

  const handleDownloadPdf = async () => {
    const receiptElement = document.getElementById('ride-receipt-content');
    if (!receiptElement) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not find receipt content to download.",
          });
        return;
    }
    
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(receiptElement, {
            scale: 2, // Higher scale for better quality
        });
        const imgData = canvas.toDataURL('image/png');
        
        // Using A4 dimensions in 'pt' units for jsPDF
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let newCanvasWidth = pdfWidth;
        let newCanvasHeight = pdfWidth / ratio;
        
        if (newCanvasHeight > pdfHeight) {
            newCanvasHeight = pdfHeight;
            newCanvasWidth = pdfHeight * ratio;
        }
        
        const xOffset = (pdfWidth - newCanvasWidth) / 2;
        const yOffset = 0;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, newCanvasWidth, newCanvasHeight);
        pdf.save(`mithilacab-receipt-${ride.id.substring(0, 8)}.pdf`);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "An error occurred while generating the PDF.",
        });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleReportSubmit = () => {
    // In a real app, you'd submit this to your backend
    console.log({
        rideId: ride.id,
        issueType,
        issueDescription,
    });
    toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. Our support team will review your report shortly.",
    });
    setIsReportDialogOpen(false); // Close dialog
    setIssueType('');
    setIssueDescription('');
  };

  const isPastRide = ride.status === 'completed' || ride.status === 'cancelled';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex flex-1 items-start gap-4">
              <Avatar className="w-12 h-12 border">
                  <AvatarImage src={ride.driver?.image?.imageUrl} alt={ride.driver?.name} data-ai-hint={ride.driver?.image?.imageHint} />
                  <AvatarFallback>{ride.driver?.name?.charAt(0) ?? 'D'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                  <p className="font-semibold">{getFormattedDate(ride.startTime)}</p>
                  <div className="mt-2 text-sm space-y-1">
                      <p><span className="font-medium text-primary">From:</span> {ride.pickupLocation}</p>
                      <p><span className="font-medium text-accent">To:</span> {ride.destinationLocation}</p>
                  </div>
              </div>
          </div>

          <div className="flex sm:flex-col justify-between items-end gap-2 sm:border-l sm:pl-4">
              <div className="text-right">
                  <p className="font-bold text-xl flex items-center">
                      <IndianRupee size={20} />
                      {ride.fareAmount ? ride.fareAmount.toFixed(2) : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Fare</p>
              </div>
              <div className="space-y-1 text-right">
                  <p className="font-semibold text-sm">{ride.driver?.name ?? 'Searching...'}</p>
                  {ride.driver && (
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                          <span>{ride.driver.rating?.toFixed(1) ?? 'N/A'}</span>
                      </div>
                  )}
                  {ride.rating && (
                    <div className="flex items-center justify-end gap-1 text-xs mt-1">
                          <span className="text-muted-foreground">You rated:</span>
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                          <span>{ride.rating}</span>
                    </div>
                  )}
                  {ride.status && <Badge variant={statusVariant[ride.status] || 'secondary'} className="mt-1">{ride.status}</Badge>}
              </div>
          </div>
        </CardContent>
        {isPastRide && (
          <CardFooter className="p-4 pt-0 flex items-center justify-end gap-2">
              {ride.status === 'completed' && (
                  <Button onClick={() => setIsReceiptOpen(true)} variant="outline" size="sm" className="mr-auto">
                      <Eye className="mr-2 h-4 w-4" />
                      View Receipt
                  </Button>
              )}

              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                  <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                          <Flag className="mr-2 h-4 w-4" /> Report Issue
                      </Button>
                  </DialogTrigger>
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                      <DialogHeader>
                          <DialogTitle>Report an issue</DialogTitle>
                          <DialogDescription>
                              Your feedback helps us improve.
                              <br />
                              <span className="font-semibold text-foreground">Ride to {ride.destinationLocation}</span>
                          </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                          <div className="space-y-2">
                              <Label htmlFor="issue-type">Type of Issue</Label>
                              <Select onValueChange={setIssueType}>
                                  <SelectTrigger id="issue-type">
                                      <SelectValue placeholder="Select an issue type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="unsafe-ride">Unsafe Ride</SelectItem>
                                      <SelectItem value="fare-dispute">Fare Dispute</SelectItem>
                                      <SelectItem value="driver-behavior">Driver Behavior</SelectItem>
                                      <SelectItem value="item-lost">Lost an item</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="issue-description">Description</Label>
                              <Textarea
                                  id="issue-description"
                                  placeholder="Please provide details about the issue."
                                  value={issueDescription}
                                  onChange={(e) => setIssueDescription(e.target.value)}
                              />
                          </div>
                      </div>
                      <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                          <Button type="submit" onClick={handleReportSubmit} disabled={!issueType || !issueDescription}>
                              Submit Report
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
              
              <Button asChild variant="ghost" size="sm">
                  <Link href={`/home?pickup=${encodeURIComponent(ride.pickupLocation)}&destination=${encodeURIComponent(ride.destinationLocation)}`}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rebook
                  </Link>
              </Button>
          </CardFooter>
        )}
      </Card>
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-2xl p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Ride Receipt</DialogTitle>
              <DialogDescription>
                A receipt for your ride to {ride.destinationLocation} on {getFormattedDate(ride.startTime)}.
              </DialogDescription>
            </DialogHeader>
            <RideReceipt ride={ride} />
            <DialogFooter className="p-4 border-t bg-muted/50 sm:justify-between">
                <Button variant="ghost" onClick={() => setIsReceiptOpen(false)}>Close</Button>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? 'Downloading...' : (
                        <>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

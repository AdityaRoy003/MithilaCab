'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Zap, Check, Star, ShieldCheck, Ticket, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PowerPassPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleActivate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsActive(true);
      setIsProcessing(false);
      setIsDialogOpen(false);
      toast({
        title: 'Power Pass Activated! 🎉',
        description: 'You now get 25% OFF on all Bike Taxi & Auto rides for 30 days.',
      });
    }, 1200);
  };

  const handleCancel = () => {
    setIsActive(false);
    toast({
      variant: 'destructive',
      title: 'Power Pass Cancelled',
      description: 'Your subscription has been cancelled.',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>Mithila Gaadi Power Pass</span>
            </h1>
            <p className="text-xs text-muted-foreground">Save up to ₹1,500 every month on daily commutes</p>
          </div>
        </div>

        {/* Hero Pass Card */}
        <Card className="border-2 border-amber-400 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-black">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-black text-amber-400 font-black text-xs uppercase px-2.5 py-0.5">
                  EXCLUSIVE PASS
                </Badge>
                <h2 className="text-2xl font-black mt-2">Mithila Gold Pass</h2>
                <p className="text-xs font-bold text-black/80">30 Days Unlimited Savings</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-black/15 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 bg-black text-amber-400 rounded-full p-0.5" />
                <span>Flat 25% OFF on every Bike Taxi ride</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 bg-black text-amber-400 rounded-full p-0.5" />
                <span>Zero Surge Pricing during peak festival hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 bg-black text-amber-400 rounded-full p-0.5" />
                <span>Priority Captain matching within 60 seconds</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-black/15">
              <div>
                <span className="text-3xl font-black">₹99</span>
                <span className="text-xs font-bold text-black/70"> / month</span>
              </div>
              {isActive ? (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="rounded-xl border-black text-black font-black hover:bg-black/10"
                >
                  Cancel Pass
                </Button>
              ) : (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-black hover:bg-black/90 text-amber-400 font-black rounded-xl text-sm px-5 h-10 shadow-lg"
                >
                  Buy Pass for ₹99
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-black text-lg">Confirm Power Pass</DialogTitle>
              <DialogDescription>
                Pay ₹99 from your wallet or UPI to unlock 30 days of discounts.
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 rounded-xl bg-amber-400/15 border border-amber-400 text-xs font-bold space-y-1">
              <p className="text-amber-700 dark:text-amber-400">Total payable: ₹99</p>
              <p className="text-muted-foreground text-[11px]">Valid across Darbhanga, Madhubani & Samastipur</p>
            </div>
            <DialogFooter>
              <Button
                onClick={handleActivate}
                disabled={isProcessing}
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-black rounded-xl h-11"
              >
                {isProcessing ? 'Activating...' : 'Pay ₹99 & Activate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

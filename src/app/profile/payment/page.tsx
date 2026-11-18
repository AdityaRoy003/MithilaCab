'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Banknote,
  IndianRupee,
  CreditCard,
  Wallet,
  Plus,
  History,
  Tag,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: string;
  date: string;
  amount: number;
  isCredit: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('200');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('/api/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.walletBalance !== undefined) {
          setWalletBalance(data.walletBalance);
        }
        if (data.transactions && Array.isArray(data.transactions)) {
          const formatted = data.transactions.map((tx: any) => ({
            id: tx.id || 'tx_' + Math.random(),
            type: tx.type || 'Wallet Transaction',
            date: new Date(tx.date || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            amount: tx.amount,
            isCredit: Boolean(tx.isCredit),
          }));
          setTransactions(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid amount to add.' });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.walletBalance !== undefined) {
        setWalletBalance(data.walletBalance);
      } else {
        setWalletBalance((prev) => prev + amount);
      }

      setTransactions((prev) => [
        {
          id: 'tx_' + Date.now(),
          type: 'Wallet Top-up (UPI)',
          date: 'Just now',
          amount,
          isCredit: true,
        },
        ...prev,
      ]);

      toast({
        title: 'Money Added Successfully! 🎉',
        description: `₹${amount} added to your Mithila Gaadi Wallet.`,
      });
      setIsTopUpOpen(false);
    } catch (e) {
      setWalletBalance((prev) => prev + amount);
      setIsTopUpOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-4 md:py-6 space-y-5">
        {/* Navigation Back */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Wallet & Payments
          </h1>
        </div>

        {/* Rapido Wallet Hero Card */}
        <Card className="border-2 border-amber-400 shadow-xl rounded-2xl overflow-hidden bg-card">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-5 text-black">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-amber-400 px-2 py-0.5 rounded">
                  मिथिला गाड़ी Wallet
                </span>
                <p className="text-xs font-semibold text-black/80 mt-1">Available Balance</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-4xl font-black tracking-tight">₹{walletBalance}</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-md">
                <Wallet className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> 1-Tap Auto Payment on Rides
              </span>
              <Button
                size="sm"
                onClick={() => setIsTopUpOpen(true)}
                className="bg-black text-amber-400 hover:bg-black/90 font-black rounded-xl text-xs h-9 px-4 shadow"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Money
              </Button>
            </div>
          </div>
        </Card>

        {/* Top-up Dialog */}
        <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-black text-lg">Add Money to Wallet</DialogTitle>
              <DialogDescription>Top up your Mithila Gaadi balance instantly via UPI</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-lg">₹</span>
                  <Input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="pl-8 text-xl font-black h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt.toString())}
                    className={cn(
                      'py-2 rounded-xl text-xs font-bold border transition-all',
                      topUpAmount === amt.toString()
                        ? 'border-amber-400 bg-amber-400 text-black font-black'
                        : 'border-border hover:bg-muted text-foreground'
                    )}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              {/* UPI Methods */}
              <div className="p-3 rounded-xl bg-muted/40 space-y-2 border border-border">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Pay via UPI</p>
                <div className="flex gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((upi) => (
                    <span key={upi} className="text-[11px] font-bold px-2 py-1 rounded bg-card border text-foreground">
                      {upi}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleTopUp}
                disabled={isProcessing}
                className="w-full h-11 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase rounded-xl"
              >
                {isProcessing ? 'Processing UPI...' : `Pay ₹${topUpAmount} & Add`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Accepted Payment Modes */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Payment Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Cash to Captain</p>
                  <p className="text-xs text-muted-foreground">Pay physical cash to Captain at destination</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Direct UPI QR Code</p>
                  <p className="text-xs text-muted-foreground">Scan Captain's QR on GPay, PhonePe, Paytm</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Supported
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider px-1">
            Transaction History
          </h3>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl border bg-card shadow-xs"
              >
                <div>
                  <p className="font-bold text-sm text-foreground">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'font-black text-sm',
                      tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                    )}
                  >
                    {tx.isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Success</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

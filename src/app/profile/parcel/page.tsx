'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, MapPin, User, Phone, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ParcelPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pickup, setPickup] = useState('Darbhanga Tower, Darbhanga');
  const [destination, setDestination] = useState('V2 Mall, Darbhanga');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageType, setPackageType] = useState('Documents');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination || !receiverName || !receiverPhone) {
      toast({
        variant: 'destructive',
        title: 'Missing Details',
        description: 'Please fill in pickup, drop, and recipient contact information.',
      });
      return;
    }

    setIsSubmitting(true);
    // Redirect to booking flow with prefilled parcel parameters
    router.push(
      `/home?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&type=Parcel`
    );
    toast({
      title: 'Parcel Delivery Initiated',
      description: 'Matching an express Rapido parcel delivery Captain for you.',
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
              <span>Send a Parcel (पार्सल)</span>
            </h1>
            <p className="text-xs text-muted-foreground">Door-to-door express delivery across Mithilanchal</p>
          </div>
        </div>

        <Card className="border-2 border-amber-400 shadow-xl rounded-2xl overflow-hidden bg-card">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-black flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-black text-amber-400 flex items-center justify-center font-bold">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-base leading-tight">Instant Courier Delivery</h3>
                <p className="text-xs font-semibold text-black/80">Delivered within 30-45 minutes</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black">₹35</span>
              <p className="text-[10px] uppercase font-bold text-black/70">Base Fare</p>
            </div>
          </div>

          <CardContent className="p-5">
            <form onSubmit={handleBookParcel} className="space-y-4">
              {/* Pickup & Drop */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                    placeholder="Enter pickup address"
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Delivery Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    placeholder="Where should the parcel be delivered?"
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Receiver Info */}
              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Recipient Contact Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Recipient Name</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="Ramesh Jha"
                        required
                        className="pl-8 h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Recipient Mobile</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="+91 98xxx xxxxx"
                        required
                        className="pl-8 h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Package Category</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['Documents', 'Food & Sweets', 'Clothes', 'Electronics'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPackageType(cat)}
                      className={cn(
                        'py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all',
                        packageType === cat
                          ? 'border-amber-400 bg-amber-400/15 text-amber-600 dark:text-amber-400'
                          : 'border-border hover:bg-muted text-foreground'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Secure Delivery with Recipient PIN verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Delivery Partner assigned in 2 minutes</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase text-sm rounded-xl shadow-lg shadow-amber-400/20"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Parcel Request (₹45)'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

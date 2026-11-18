'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function SavedAddressesPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState([
    { id: 'addr_1', label: 'Home (घर)', address: 'Darbhanga Tower, Darbhanga', icon: Home },
    { id: 'addr_2', label: 'Work (ऑफिस)', address: 'Mithila University Campus, Darbhanga', icon: Briefcase },
  ]);

  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newAddress) return;

    setAddresses((prev) => [
      ...prev,
      {
        id: 'addr_' + Date.now(),
        label: newLabel,
        address: newAddress,
        icon: MapPin,
      },
    ]);

    setNewLabel('');
    setNewAddress('');
    setIsAdding(false);
    toast({
      title: 'Address Saved',
      description: `${newLabel} has been added to your favorite spots.`,
    });
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Address Removed' });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Saved Addresses
            </h1>
            <p className="text-xs text-muted-foreground">Quick 1-tap booking for your daily destinations</p>
          </div>
        </div>

        {/* Existing Addresses */}
        <div className="space-y-3">
          {addresses.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="border shadow-xs rounded-2xl overflow-hidden bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{item.label}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.address}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-muted-foreground hover:text-destructive rounded-full h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Address Form */}
        {isAdding ? (
          <Card className="border-2 border-amber-400 shadow-lg rounded-2xl p-4">
            <form onSubmit={handleAddAddress} className="space-y-3">
              <h3 className="font-bold text-sm">Add New Spot</h3>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Label (e.g. Gym, Friend's House)</Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Tuition / Gym"
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Address in Mithila</Label>
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Donar Chowk, Darbhanga"
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl h-10 text-xs font-bold bg-amber-400 hover:bg-amber-500 text-black"
                >
                  Save Spot
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full h-11 border-2 border-dashed border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 text-foreground font-bold rounded-2xl"
          >
            <Plus className="h-4 w-4 mr-2 text-amber-500" /> Add Another Favorite Location
          </Button>
        )}
      </div>
    </AppLayout>
  );
}

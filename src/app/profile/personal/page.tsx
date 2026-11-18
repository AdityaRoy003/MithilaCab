'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Phone, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PersonalInfoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('Aditya Kumar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('aditya.roy@example.com');
  const [city, setCity] = useState('Darbhanga');
  const [emergencyName, setEmergencyName] = useState('Family Emergency');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 91422 77483');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Profile Updated! ✅',
        description: 'Your details have been saved successfully.',
      });
    }, 600);
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
              Personal Profile
            </h1>
            <p className="text-xs text-muted-foreground">Manage your name, phone, and safety contacts</p>
          </div>
        </div>

        <Card className="border shadow-md rounded-2xl overflow-hidden bg-card">
          <CardContent className="p-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Mobile Number (Login & Rides)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl font-medium font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Home City in Mithilanchal</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-11 rounded-xl font-medium">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Darbhanga">Darbhanga (दरभंगा)</SelectItem>
                    <SelectItem value="Madhubani">Madhubani (मधुबनी)</SelectItem>
                    <SelectItem value="Samastipur">Samastipur (समस्तीपुर)</SelectItem>
                    <SelectItem value="Laheriasarai">Laheriasarai (लहेरियासराय)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Emergency Contact */}
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span>Emergency SOS Contact</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Contact Name</Label>
                    <Input
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Contact Number</Label>
                    <Input
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="h-10 text-xs rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-11 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase text-xs rounded-xl shadow-md mt-2"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

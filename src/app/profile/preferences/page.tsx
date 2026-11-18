'use client';

import { useState } from 'react';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { RideType } from '@/lib/data';

export default function PreferencesPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [defaultRideType, setDefaultRideType] = useState<RideType>('Standard');
  const [language, setLanguage] = useState('en');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Preferences Saved! ✅",
        description: "Your ride and language preferences have been updated.",
      });
    }, 400);
  };

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/profile')} className="h-8 px-2 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </div>
        <h1 className="font-headline text-2xl font-bold mb-6">Ride Preferences</h1>
        
        <div className="max-w-2xl">
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle>Customize Your Experience</CardTitle>
              <CardDescription>Adjust your app settings for Mithila गाड़ी.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Ride Option</Label>
                <Select value={defaultRideType} onValueChange={(value) => setDefaultRideType(value as RideType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a ride type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Standard">Bike Taxi (Fastest & Most Affordable)</SelectItem>
                    <SelectItem value="Share">Mithila Auto (Family & Luggage)</SelectItem>
                    <SelectItem value="Premium">Comfort Cab (AC Car)</SelectItem>
                    <SelectItem value="SUV">SUV (Outstation / Group)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="mai">मैथिली (Maithili)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="accessibility" className="text-sm font-semibold">Accessibility Needs</Label>
                  <p className="text-xs text-muted-foreground">Request vehicles with step-in support or extra room.</p>
                </div>
                <Switch id="accessibility" checked={accessibilityNeeds} onCheckedChange={setAccessibilityNeeds} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges} disabled={isSaving} className="font-bold rounded-xl bg-amber-400 text-black hover:bg-amber-500">
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}

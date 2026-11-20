
'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';
import { SignupForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const bgImage = PlaceHolderImages.find(img => img.id === 'login-bg');

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8">
        <div className="mx-auto grid w-full max-w-md gap-8">
            <Logo size="lg" showTagline />
            <div className="grid gap-2">
                <h1 className="font-headline text-4xl font-bold">Join MithilaCab</h1>
                <p className="text-muted-foreground">Your ride, your way.</p>
            </div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardDescription>
                  Create your account to get started. It's quick and easy!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>}>
                  <SignupForm />
                </Suspense>
              </CardContent>
            </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            priority
            data-ai-hint={bgImage.imageHint}
            className="object-cover dark:brightness-[0.3]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-10 left-10 right-10">
            <div className="p-8 rounded-xl bg-black/50 backdrop-blur-lg border border-white/10">
                 <blockquote className="text-white text-xl font-medium leading-relaxed">
                     "The best way to get around the city. Fast, reliable, and always a pleasant ride. I can't imagine my commute without it!"
                 </blockquote>
                 <p className="text-white/70 mt-4 text-sm font-semibold">- A Happy Customer</p>
            </div>
         </div>
      </div>
    </div>
  );
}

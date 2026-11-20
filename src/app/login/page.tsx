'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const bgImage = PlaceHolderImages.find(img => img.id === 'login-bg');

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-[350px] gap-8">
          <div className="grid gap-4 text-center">
            <Logo className="justify-center" size="lg" showTagline />
            <h1 className="font-headline text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            width={1800}
            height={1200}
            priority
            data-ai-hint={bgImage.imageHint}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}

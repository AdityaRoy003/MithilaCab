'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/logo';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const bgImage = PlaceHolderImages.find(img => img.id === 'login-bg');
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
       <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-[350px] gap-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid gap-4 mt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full mt-2" />
                </div>
            </div>
        </div>
         <div className="hidden bg-muted lg:block">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-[350px] gap-8">
          <div className="grid gap-4 text-center">
            <Logo className="justify-center" />
            <h1 className="font-headline text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
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

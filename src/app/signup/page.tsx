
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SignupForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
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
            <Card className="mx-auto w-full max-w-md">
                <CardHeader>
                    <Skeleton className="h-10 w-48 mx-auto mb-4" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 mt-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </div>
                </CardContent>
            </Card>
        </div>
         <div className="hidden bg-muted lg:block">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8">
        <div className="mx-auto grid w-full max-w-md gap-8">
            <Logo />
            <div className="grid gap-2">
                <h1 className="font-headline text-4xl font-bold">Join MithilaCab</h1>
                <p className="text-muted-foreground">Your ride, your way.</p>
            </div>
            <Card className="shadow-2xl">
              <CardHeader>
                <CardDescription>
                  Create your account to get started. It's quick and easy!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignupForm />
                 <div className="mt-6 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/" className="underline font-medium hover:text-primary transition-colors">
                        Login
                    </Link>
                </div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
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

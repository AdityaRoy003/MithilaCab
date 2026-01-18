import { OtpForm } from '@/components/auth/otp-form';
import { Logo } from '@/components/logo';

export default function OtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto grid w-[350px] gap-8 text-center">
        <Logo className="justify-center" />
        <div className="grid gap-2">
          <h1 className="font-headline text-3xl font-bold">Verify Your Account</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your phone number.
          </p>
        </div>
        <OtpForm />
      </div>
    </div>
  );
}

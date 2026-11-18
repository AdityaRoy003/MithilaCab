"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const errorParam = searchParams.get('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phoneOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Save verified user session
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      toast({
        title: `Welcome back, ${data.user.name}! 🎉`,
        description: `Logged in successfully as ${data.user.role.toUpperCase()}.`,
      });

      const redirectPath = data.redirectUrl || (data.user.role === 'admin' ? '/admin' : data.user.role === 'captain' ? '/driver' : '/home');
      router.push(redirectPath);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid credentials. Please verify your details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-5">
      {errorParam && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {errorParam === 'admin_required' && '🔒 Admin privileges required to access the Admin Console.'}
          {errorParam === 'captain_required' && '🏍️ Captain account required to access Driver Dashboard.'}
        </div>
      )}

      <form onSubmit={handleLogin} className="grid gap-3.5">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Mobile Number or Email</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="+91 98765 43210 or email"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="pl-9 h-11 rounded-xl"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/otp" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 h-11 rounded-xl"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase text-xs rounded-xl shadow-md transition-transform active:scale-[0.99] mt-1"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Sign In to Mithila Gaadi
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4 font-bold text-foreground hover:text-amber-500">
          Create an account (Sign up)
        </Link>
      </div>
    </div>
  );
}

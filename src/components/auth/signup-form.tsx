
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Car, KeyRound, Mail, Phone, User as UserIcon, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid 10-digit phone number.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["passenger", "driver"], {
    required_error: "You need to select a role.",
  }),
});

const roles = [
    { value: 'passenger' as const, label: 'Passenger', icon: UserIcon },
    { value: 'driver' as const, label: 'Driver', icon: Car },
];

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "passenger",
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'driver') {
        form.setValue('role', 'driver');
      }
    }
  }, [form]);

  const { formState: { errors } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus('submitting');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          password: values.password,
          role: values.role === 'driver' ? 'captain' : 'user',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account.');
      }

      if (typeof window !== 'undefined') {
        if (data.token) localStorage.setItem('auth_token', data.token);
        if (data.user) localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      toast({
        title: "Account Created!",
        description: `Welcome to Mithila गाड़ी, ${data.user?.name || values.name}! Welcome bonus of ₹250 added to your wallet.`,
      });

      setStatus('success');
      setTimeout(() => {
        if (values.role === 'driver') {
          router.push("/driver");
        } else {
          router.push("/home");
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
      setStatus('idle');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <Label className="text-center block">I am signing up as a...</Label>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="relative grid grid-cols-2 gap-4"
                >
                    {roles.map((role) => (
                      <motion.div 
                        key={role.value}
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Label
                            className={cn(
                                "relative flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors",
                                field.value === role.value ? 'border-primary' : 'border-muted hover:bg-accent/50'
                            )}
                        >
                            {field.value === role.value && (
                                <motion.div
                                    layoutId="role-highlight"
                                    className="absolute inset-0 rounded-md bg-primary/10 shadow-inner"
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                />
                            )}
                            <RadioGroupItem value={role.value} className="sr-only" />
                            <role.icon className={cn("relative z-10 mb-2 h-6 w-6", field.value === role.value && "text-primary")} />
                            <span className={cn("relative z-10", field.value === role.value && "text-primary font-semibold")}>{role.label}</span>
                        </Label>
                      </motion.div>
                    ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="Full Name" 
                    {...field} 
                    className={cn("pl-9", errors.name && "animate-shake border-destructive")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="Email" 
                    {...field} 
                    className={cn("pl-9", errors.email && "animate-shake border-destructive")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                 <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="Phone Number" 
                    {...field} 
                    className={cn("pl-9", errors.phone && "animate-shake border-destructive")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                 <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password"
                    {...field} 
                    className={cn("pl-9 pr-10", errors.password && "animate-shake border-destructive")}
                  />
                   <AnimatePresence mode="wait" initial={false}>
                      <motion.button
                        key={showPassword ? "eye-off" : "eye"}
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.2 }}
                        type="button"
                        className="absolute right-0 inset-y-0 my-auto h-full w-10 text-muted-foreground flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                      </motion.button>
                  </AnimatePresence>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold transition-all" disabled={status !== 'idle'}>
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Create Account
              </motion.span>
            )}
            {status === 'submitting' && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { delay: 0.2, type: "tween", ease: "easeOut", duration: 0.3 },
                      opacity: { delay: 0.2, duration: 0.01 }
                    }}
                  />
                </motion.svg>
                Account Created!
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
         <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium hover:text-primary transition-colors">
                Login
            </Link>
        </div>
      </form>
    </Form>
  );
}

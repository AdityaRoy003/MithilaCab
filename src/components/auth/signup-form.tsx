
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Car, KeyRound, Mail, Phone, User as UserIcon, Eye, EyeOff, Loader2 } from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
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
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

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

  const { formState: { isSubmitting, errors } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.name,
      });

      // All users get a user document with their role.
      const userProfile = {
        id: user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        dateJoined: serverTimestamp(),
        photoURL: user.photoURL,
        role: values.role, // This will be 'passenger' or 'driver'
      };
      const userDocRef = doc(firestore, "users", user.uid);
      setDoc(userDocRef, userProfile, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: userProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      if (values.role === 'driver') {
        // Drivers also get a separate driver document.
        const driverProfile = {
          id: user.uid,
          name: values.name,
          email: values.email,
          phone: values.phone,
          isAvailable: false,
          rating: 5,
          vehicle: "Not specified",
          licensePlate: "N/A",
          image: {
            id: "driver-3",
            description: "Portrait of a person smiling",
            imageUrl: "https://images.unsplash.com/photo-1607529378676-a20456ee2f6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBzbWlsaW5nfGVufDB8fHx8MTc2ODYzNzM4MHww&ixlib=rb-4.1.0&q=80&w=1080",
            imageHint: "person smiling"
          },
          dateJoined: serverTimestamp(),
        };
        const driverDocRef = doc(firestore, "drivers", user.uid);
        setDoc(driverDocRef, driverProfile).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: driverDocRef.path,
                operation: 'create',
                requestResourceData: driverProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        router.push("/driver");
      } else {
        router.push("/home");
      }
      
    } catch (error: any) {
      console.error("Signup Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: "This email address is already in use. Please try logging in.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message || "An unexpected error occurred. Please try again.",
        });
      }
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
              <FormLabel className="text-center block">I am signing up as a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="relative grid grid-cols-2 gap-4"
                >
                    {roles.map((role) => (
                        <Label
                            key={role.value}
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
                    placeholder=" " 
                    {...field} 
                    className={cn("peer pl-9", errors.name && "animate-shake border-destructive")}
                  />
                  <FormLabel htmlFor="name" className="absolute left-9 origin-[0] pointer-events-none duration-300 text-muted-foreground top-2 -translate-y-4 scale-75 text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:text-primary">
                    Full Name
                  </FormLabel>
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
                    placeholder=" " 
                    {...field} 
                    className={cn("peer pl-9", errors.email && "animate-shake border-destructive")}
                  />
                  <FormLabel htmlFor="email" className="absolute left-9 origin-[0] pointer-events-none duration-300 text-muted-foreground top-2 -translate-y-4 scale-75 text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:text-primary">
                    Email
                  </FormLabel>
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
                    placeholder=" " 
                    {...field} 
                    className={cn("peer pl-9", errors.phone && "animate-shake border-destructive")}
                  />
                  <FormLabel htmlFor="phone" className="absolute left-9 origin-[0] pointer-events-none duration-300 text-muted-foreground top-2 -translate-y-4 scale-75 text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:text-primary">
                    Phone Number
                  </FormLabel>
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
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder=" "
                    {...field} 
                    className={cn("peer pl-9 pr-10", errors.password && "animate-shake border-destructive")}
                  />
                  <FormLabel htmlFor="password" className="absolute left-9 origin-[0] pointer-events-none duration-300 text-muted-foreground top-2 -translate-y-4 scale-75 text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:text-primary">
                    Password
                  </FormLabel>
                   <AnimatePresence mode="wait" initial={false}>
                      <motion.button
                        key={showPassword ? "eye-off" : "eye"}
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.2 }}
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground flex items-center justify-center"
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
        <Button type="submit" className="w-full font-bold transition-colors" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
}


'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Car, KeyRound, Mail, Phone, User as UserIcon, Eye, EyeOff } from "lucide-react";


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
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am signing up as a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                    <Label className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all", field.value === 'passenger' ? 'border-primary bg-primary/10 shadow-md' : 'border-muted hover:bg-accent/50')}>
                        <RadioGroupItem value="passenger" className="sr-only" />
                        <UserIcon className="mb-2 h-6 w-6" />
                        Passenger
                    </Label>
                    <Label className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all", field.value === 'driver' ? 'border-primary bg-primary/10 shadow-md' : 'border-muted hover:bg-accent/50')}>
                        <RadioGroupItem value="driver" className="sr-only" />
                        <Car className="mb-2 h-6 w-6" />
                        Driver
                    </Label>
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Your Name" {...field} className="pl-9" />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="name@example.com" {...field} className="pl-9" />
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="9876543210" {...field} className="pl-9" />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...field} 
                    className="pl-9 pr-10" 
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}

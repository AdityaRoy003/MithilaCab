'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, animate, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ChevronDown, MapPin, Menu, Quote, Car, Smartphone, Star, Wallet, X, Upload, Users, Award, IndianRupee, Clock, UserPlus, UploadCloud, ShieldCheck, Navigation, Facebook, Instagram, MessageSquare, Globe, Send, CheckCircle, ArrowRight, LifeBuoy, Phone, Mail, Twitter, Linkedin, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';
import { ThemeToggle } from '@/components/theme-toggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';


// Reusable NavLink component for animated underline effect
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="group relative text-sm font-medium transition-colors hover:text-primary">
    {children}
    <span className="absolute bottom-[-4px] left-0 block h-0.5 w-full max-w-0 bg-primary transition-all duration-300 group-hover:max-w-full"></span>
  </Link>
);

function AnimatedCounter({ to, suffix, from = 0, duration = 2 }: { to: number; from?: number; duration?: number, suffix?: string }) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix || ''}`);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
  
    useEffect(() => {
      if (isInView) {
        const controls = animate(count, to, { duration });
        return controls.stop;
      }
    }, [isInView, count, to, duration]);
  
    return <motion.h3 ref={ref} className="text-4xl font-bold mt-2">{rounded}</motion.h3>;
}


export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'mithila-hero');
  const appScreenImage = PlaceHolderImages.find(img => img.id === 'app-screen-1');
  const madhubaniImages = PlaceHolderImages.filter(img => img.id.startsWith('madhubani-'));
  const mithilaMapImage = PlaceHolderImages.find(img => img.id === 'mithila-map');
  const testimonialImages = [
      PlaceHolderImages.find(img => img.id === 'testimonial-1'),
      PlaceHolderImages.find(img => img.id === 'testimonial-2')
  ].filter(Boolean);


  const headline = "Mithila गाड़ी";
  const subHeadline = "Bharat's Fastest Bike Taxi, Auto & Parcel App";

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);

  const artStripRef = useRef(null);
  const { scrollYProgress: scrollYProgressArt } = useScroll({
      target: artStripRef,
      offset: ["start end", "end start"]
  });
  const artX = useTransform(scrollYProgressArt, [0, 1], ["-10%", "10%"]);


  // Animation variants for the hero section content
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Increased stagger for a more noticeable "typewriter" effect
        delayChildren: 0.3,
      },
    },
  };

  // Staggered animation for each word in the headline
  const wordVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
  };

  // Animation for the paragraph and search bar
  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100, damping: 12, delay: 1 }
    },
  };

  const [scrolled, setScrolled] = useState(false);
  const [isFareCalculatorOpen, setIsFareCalculatorOpen] = useState(false);
  const [pickupCalc, setPickupCalc] = useState('');
  const [destinationCalc, setDestinationCalc] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [flippedStep, setFlippedStep] = useState<number | null>(null);
  const [flippedTrust, setFlippedTrust] = useState<number | null>(null);
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [destination, setDestination] = useState("");
  const router = useRouter();

  const handleFindRide = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/login?destination=${encodeURIComponent(destination)}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  const testimonials = [
      {
          quote: "Rapido makes it so easy and fast to travel across town. The Captains are polite, helmets are always provided, and fares are so low!",
          name: "Sanjay Kumar",
          role: "Frequent Rider, Darbhanga",
          image: testimonialImages[0]
      },
      {
          quote: "As a student, I rely on Rapido Bike Taxi for my daily college commute. It beats all traffic and costs under ₹35!",
          name: "Priya Singh",
          role: "Student, Madhubani",
          image: testimonialImages[1]
      }
  ];

  const handleFareCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupCalc && destinationCalc) {
      // Simple fare simulation logic
      const dist = Math.random() * 20 + 2;
      const baseFare = 40;
      const perKmRate = 12;
      const finalFare = Math.round(baseFare + dist * perKmRate);
      setEstimatedFare(finalFare);
    }
  };

  const onboardingSteps = [
    { icon: UserPlus, title: "Quick Sign-Up", description: "Create your driver profile in just a few minutes with your basic information.", step: "01" },
    { icon: UploadCloud, title: "Upload Documents", description: "Submit your driver's license, vehicle registration, and insurance for verification.", step: "02" },
    { icon: ShieldCheck, title: "Get Verified", description: "Our team will review your documents. Once approved, you're ready to hit the road.", step: "03" },
    { icon: Car, title: "Start Driving", description: "Go online, accept your first ride, and start earning on your own schedule.", step: "04" },
  ];

  const trustBadges = [
    {
        icon: ShieldCheck,
        title: "Verified Drivers",
        description: "Every driver is background-checked and trained for a safe, professional ride.",
        details: "Our rigorous vetting process includes identity verification, criminal background checks, and vehicle inspections to ensure your safety and peace of mind.",
        color: "text-chart-5"
    },
    {
        icon: CreditCard,
        title: "Secure Payments",
        description: "Pay with confidence through our secure, encrypted payment system.",
        details: "We use industry-standard encryption to protect your financial data. Your payment information is never stored on our servers and all transactions are processed through a PCI-compliant gateway.",
        color: "text-chart-4"
    },
    {
        icon: LifeBuoy,
        title: "24/7 Support",
        description: "Our dedicated support team is always available to help you with any questions.",
        details: "Whether you have a question about a ride, need help with the app, or have a safety concern, our support team is available 24/7 via live chat, email, or phone.",
        color: "text-chart-1"
    }
  ];

  const handleFlip = (index: number) => {
    setFlippedStep(flippedStep === index ? null : index);
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('submitting');
    // Simulate API call
    setTimeout(() => {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus('idle'), 3000); // Reset after 3s
    }, 1000);
  };

  const handleLanguageChange = (lang: string) => {
    let languageName = 'English';
    if (lang === 'hi') languageName = 'Hindi';
    if (lang === 'mai') languageName = 'Maithili';
    toast({
        title: "Language Switched",
        description: `App language has been set to ${languageName}. (UI Demo)`,
    });
  };
  
    const faqs = [
    {
        question: "How do I book a ride with Rapido?",
        answer: "You can book a ride easily through our app. Just enter your destination in the 'Where to?' box, choose Bike Taxi, Auto, Cab, or Parcel, and confirm your booking. We'll match a nearby Captain in under 2 minutes with an OTP."
    },
    {
        question: "What are your service areas in Mithilanchal?",
        answer: "We currently operate in major cities and towns across the Mithilanchal region, including Darbhanga, Madhubani, Samastipur, and surrounding areas. We are continuously expanding our service network."
    },
    {
        question: "How is the fare calculated?",
        answer: "Our fares are calculated based on a base rate plus charges for the distance and duration of the ride. You will always see an estimated fare before you confirm your booking. Surge pricing may apply during peak hours."
    },
    {
        question: "What safety measures do you have in place?",
        answer: "Your safety is our top priority. All our drivers are verified, you can track your ride in real-time, share your journey with loved ones, and access our 24/7 support team through the app."
    },
    {
        question: "Can I schedule a ride in advance?",
        answer: "Yes! Our app allows you to schedule a ride for a later time or date. Simply select the 'Schedule' option when booking and choose your desired pickup time."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept a variety of payment methods, including credit/debit cards, UPI, and popular digital wallets. You can also pay with cash. You can manage your payment options in the 'Payment' section of the app."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? 'bg-background/90 backdrop-blur-sm shadow-md' : 'bg-transparent'
      )}>
        <div className={cn(
          "container mx-auto px-4 flex items-center justify-between transition-all duration-300",
          scrolled ? 'h-16' : 'h-20'
        )}>
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#safety">Safety</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#cultural-showcase">Culture</NavLink>
            <NavLink href="#drive">Drive with Us</NavLink>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="font-bold">
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                 <SheetHeader className="sr-only">
                   <SheetTitle>Navigation Menu</SheetTitle>
                   <SheetDescription>Mobile navigation links for Mithila Gaadi</SheetDescription>
                 </SheetHeader>
                 <div className="p-6">
                    <Logo />
                    <nav className="flex flex-col gap-6 mt-10">
                        <Link href="#features" className="text-lg font-medium hover:text-primary transition-colors">Features</Link>
                        <Link href="#safety" className="text-lg font-medium hover:text-primary transition-colors">Safety</Link>
                        <Link href="#how-it-works" className="text-lg font-medium hover:text-primary transition-colors">How It Works</Link>
                        <Link href="#cultural-showcase" className="text-lg font-medium hover:text-primary transition-colors">Culture</Link>
                        <Link href="#drive" className="text-lg font-medium hover:text-primary transition-colors">Drive with Us</Link>
                    </nav>
                     <div className="flex flex-col gap-4 mt-8">
                        <Button variant="outline" asChild size="lg">
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild className="font-bold" size="lg">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                 </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section ref={heroRef} className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          {heroImage && (
              <motion.div
                className="absolute inset-0 w-full h-full z-0"
                style={{ y: backgroundY }}
              >
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  quality={100}
                  priority
                  className="absolute inset-0 w-full h-full object-cover dark:brightness-50"
                  data-ai-hint={heroImage.imageHint}
                />
              </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-5" />
          <motion.div
            className="relative z-10 p-4 w-full"
            style={{ y: textY }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter"
              aria-label={`${headline} ${subHeadline}`}
            >
              {headline.split(" ").map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block mr-4">{word}</motion.span>
              ))}
              <br/>
              <span className="text-primary">
                {subHeadline.split(" ").map((word, index) => (
                    <motion.span key={index} variants={wordVariants} className="inline-block mr-3">{word}</motion.span>
                ))}
              </span>
            </motion.h1>
            <motion.p
              className="mt-4 max-w-xl mx-auto text-lg text-foreground/80 font-medium"
              variants={itemVariants}
            >
              Beat city traffic with Mithila गाड़ी. Lowest fares from ₹20, clean helmets provided, doorstep autos, and instant 30-min parcel deliveries.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mt-8 w-full max-w-lg mx-auto"
            >
              <form onSubmit={handleFindRide} className="flex gap-2 bg-background p-2 rounded-full shadow-lg border">
                <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      name="destination"
                      placeholder="Enter your destination..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-12 w-full rounded-full border-none pl-12 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="group rounded-full font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/40 flex items-center"
                >
                  <span>Find a Ride</span>
                  <ArrowRight className="h-5 w-5 w-0 opacity-0 transform transition-all duration-300 group-hover:ml-2 group-hover:w-5 group-hover:opacity-100" />
                </Button>
              </form>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5, ease: "easeInOut"}}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          >
             <Link href="#features" aria-label="Scroll to next section">
                <ChevronDown className="h-8 w-8 animate-bounce text-foreground/50 cursor-pointer hover:text-primary transition-colors" />
             </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                 <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                 >
                    {appScreenImage && (
                        <Image
                            src={appScreenImage.imageUrl}
                            alt={appScreenImage.description}
                            width={800}
                            height={1600}
                            className="rounded-3xl shadow-2xl mx-auto dark:opacity-80"
                            data-ai-hint={appScreenImage.imageHint}
                        />
                    )}
                </motion.div>
                 <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                 >
                    <h2 className="font-headline text-4xl font-bold">Reliable Rides, Right Away</h2>
                    <p className="text-muted-foreground text-lg">
                        Get where you need to be with our fast and easy-to-use booking system. Track your driver in real-time and enjoy a hassle-free journey every time.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Quick & Easy Booking</li>
                        <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Multiple Ride Options</li>
                        <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Transparent Pricing</li>
                    </ul>
                </motion.div>
            </div>
        </section>

        {/* Decorative Art Strip */}
        <div ref={artStripRef} className="relative h-24 my-20 md:my-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10"></div>
            {madhubaniImages[0] && (
              <motion.div style={{ x: artX, width: '120%', left: '-10%' }} className="absolute inset-0">
                  <Image
                    src={madhubaniImages[0].imageUrl}
                    alt="Madhubani art pattern"
                    fill
                    objectFit="cover"
                    className="opacity-10 dark:opacity-5"
                    data-ai-hint={madhubaniImages[0].imageHint}
                  />
              </motion.div>
            )}
        </div>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 py-20 md:py-32 bg-muted/30 rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-headline text-4xl font-bold">Booking a Ride is Easy</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Get to your destination in just a few simple steps.
            </p>
          </motion.div>

          <div className="relative mt-20 max-w-5xl mx-auto">
            {/* The path line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="text-center p-6 bg-card border rounded-lg shadow-lg relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-muted/30">1</div>
                  <div className="mt-8">
                    <MapPin className="h-10 w-10 mx-auto text-chart-1"/>
                    <h3 className="mt-4 font-semibold text-lg">Set Destination</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Enter where you want to go.</p>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                <div className="text-center p-6 bg-card border rounded-lg shadow-lg relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-muted/30">2</div>
                  <div className="mt-8">
                    <Car className="h-10 w-10 mx-auto text-chart-2"/>
                    <h3 className="mt-4 font-semibold text-lg">Confirm Ride</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Choose your ride type and confirm.</p>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
                <div className="text-center p-6 bg-card border rounded-lg shadow-lg relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-muted/30">3</div>
                  <div className="mt-8">
                    <Smartphone className="h-10 w-10 mx-auto text-chart-4"/>
                    <h3 className="mt-4 font-semibold text-lg">Track Your Driver</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Watch your driver arrive in real-time.</p>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.7 }}>
                <div className="text-center p-6 bg-card border rounded-lg shadow-lg relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-muted/30">4</div>
                  <div className="mt-8">
                    <Star className="h-10 w-10 mx-auto text-chart-3"/>
                    <h3 className="mt-4 font-semibold text-lg">Enjoy & Rate</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Enjoy your ride and rate your driver.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section id="safety" className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-headline text-4xl font-bold">Your Safety is Our Priority</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              We are committed to making every ride safe, reliable, and comfortable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="text-center p-8 h-full">
                <ShieldCheck className="h-12 w-12 mx-auto text-chart-1"/>
                <h3 className="mt-4 font-semibold text-xl">Verified Drivers</h3>
                <p className="mt-2 text-muted-foreground">All our drivers undergo a strict verification process, including background checks.</p>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="text-center p-8 h-full">
                <Navigation className="h-12 w-12 mx-auto text-chart-2"/>
                <h3 className="mt-4 font-semibold text-xl">Live Ride Tracking</h3>
                <p className="mt-2 text-muted-foreground">Share your ride status with family and friends. They can track your journey in real-time.</p>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Card className="text-center p-8 h-full">
                <MessageSquare className="h-12 w-12 mx-auto text-chart-4"/>
                <h3 className="mt-4 font-semibold text-xl">24/7 Support</h3>
                <p className="mt-2 text-muted-foreground">Our support team is available around the clock to assist you with any issues or emergencies.</p>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section id="trust" className="bg-muted/30 py-20 md:py-32">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="font-headline text-4xl font-bold">Built on Trust</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Your peace of mind is our priority, from start to finish.
                    </p>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto [perspective:1000px]">
                    {trustBadges.map((badge, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                        >
                            <div
                                className="relative w-full h-72 [transform-style:preserve-3d] cursor-pointer"
                                onClick={() => setFlippedTrust(flippedTrust === index ? null : index)}
                            >
                                {/* Front of the card */}
                                <motion.div
                                    className="absolute w-full h-full [backface-visibility:hidden] p-8 bg-card border rounded-lg flex flex-col items-center justify-center text-center"
                                    animate={{ rotateY: flippedTrust === index ? 180 : 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <badge.icon className={cn("h-12 w-12 mx-auto", badge.color)} />
                                    <h3 className="mt-4 font-semibold text-xl">{badge.title}</h3>
                                    <p className="mt-2 text-muted-foreground">{badge.description}</p>
                                    <p className="absolute bottom-4 text-xs text-muted-foreground/50 font-semibold">Click to learn more</p>
                                </motion.div>
                                
                                {/* Back of the card */}
                                <motion.div
                                    className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 bg-card border rounded-lg flex flex-col items-center justify-center text-center"
                                    animate={{ rotateY: flippedTrust === index ? 0 : -180 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h4 className="font-semibold text-lg mb-2">{badge.title}</h4>
                                    <p className="text-sm text-muted-foreground">{badge.details}</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>


        {/* Fare Calculator Section */}
        <section id="fare-calculator" className="container mx-auto px-4 py-20 md:py-32">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="bg-card border rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center"
            >
                <div className="space-y-4">
                    <h2 className="font-headline text-4xl font-bold">Plan Your Journey</h2>
                    <p className="text-muted-foreground text-lg">
                        Get a quick fare estimate for your trip with our simple calculator. No surprises, just transparent pricing.
                    </p>
                    <Sheet open={isFareCalculatorOpen} onOpenChange={setIsFareCalculatorOpen}>
                        <SheetTrigger asChild>
                            <Button size="lg" className="font-bold text-lg mt-4">
                                <Wallet className="mr-2 h-5 w-5" /> Calculate Fare
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Fare Calculator</SheetTitle>
                                <SheetDescription>
                                    Enter your pickup and destination to get an estimated fare. This is an estimate and the final fare may vary.
                                </SheetDescription>
                            </SheetHeader>
                            <form onSubmit={handleFareCalculate} className="py-8 space-y-6">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                    <Label htmlFor="pickup-calc" className="mb-2 block">Pickup Location</Label>
                                    <Input id="pickup-calc" value={pickupCalc} onChange={(e) => setPickupCalc(e.target.value)} placeholder="Enter pickup location" />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                    <Label htmlFor="dest-calc" className="mb-2 block">Destination</Label>
                                    <Input id="dest-calc" value={destinationCalc} onChange={(e) => setDestinationCalc(e.target.value)} placeholder="Enter destination" />
                                </motion.div>
                                <Button type="submit" className="w-full font-bold">Estimate Fare</Button>
                            </form>
                            {estimatedFare !== null && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className="text-center bg-accent/50">
                                        <CardHeader>
                                            <CardTitle>Estimated Fare</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-4xl font-bold">₹{estimatedFare.toFixed(2)}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
                 <div className="hidden md:flex justify-center">
                    <Wallet className="w-48 h-48 text-primary/10" strokeWidth={1} />
                </div>
            </motion.div>
        </section>

        {/* Cultural Showcase Section */}
        <section id="cultural-showcase" className="py-20 md:py-32">
          <div className="container mx-auto px-4 space-y-24">

            {/* Madhubani Art Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="font-headline text-4xl font-bold">The Art of Mithila</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Journey through the vibrant strokes of Madhubani paintings, an art form that tells the stories of our culture.
              </p>
              <Carousel
                plugins={[autoplayPlugin.current]}
                className="w-full max-w-4xl mx-auto mt-12"
                onMouseEnter={autoplayPlugin.current.stop}
                onMouseLeave={autoplayPlugin.current.reset}
              >
                <CarouselContent>
                  {madhubaniImages.map((image, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="overflow-hidden">
                          <CardContent className="flex aspect-square items-center justify-center p-0">
                            {image && <Image
                              src={image.imageUrl}
                              alt={image.description}
                              width={600}
                              height={600}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              data-ai-hint={image.imageHint}
                            />}
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>

            {/* Animated Map */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="font-headline text-4xl font-bold">Covering All of Mithilanchal</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                From the bustling streets of Darbhanga to the historic heart of Madhubani, we've got your journey covered.
              </p>
              <div className="relative w-full max-w-3xl mx-auto mt-12">
                {mithilaMapImage && (
                  <Image
                    src={mithilaMapImage.imageUrl}
                    alt={mithilaMapImage.description}
                    width={1200}
                    height={800}
                    className="w-full h-auto rounded-xl shadow-2xl dark:opacity-30"
                    data-ai-hint={mithilaMapImage.imageHint}
                  />
                )}
                {/* Pulsing Dots */}
                <a href="#" className="absolute top-[35%] left-[40%] group">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary transition-transform group-hover:scale-150"></span>
                </a>
                <a href="#" className="absolute top-[50%] left-[60%] group">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping [animation-delay:0.5s]"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary transition-transform group-hover:scale-150"></span>
                </a>
                 <a href="#" className="absolute top-[25%] left-[75%] group">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping [animation-delay:0.2s]"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary transition-transform group-hover:scale-150"></span>
                </a>
              </div>
            </motion.div>

            {/* Testimonials */}
            <div className="text-center">
              <h2 className="font-headline text-4xl font-bold">What Our Riders Say</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Hear from the people of Mithila who trust us for their daily travel.
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card className="h-full text-left">
                      <CardContent className="p-8 space-y-6">
                        <Quote className="h-8 w-8 text-primary" />
                        <p className="text-lg text-foreground/90">{testimonial.quote}</p>
                        <div className="flex items-center gap-4 pt-4">
                          {testimonial.image && (
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={testimonial.image.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.image.imageHint} />
                              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Drive With Us Section */}
        <section id="drive" className="py-20 md:py-32 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="font-headline text-4xl font-bold">Ride & Earn as a Rapido Captain</h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                  Turn your bike, auto, or car into daily earnings. Zero commission on your first 50 rides and instant daily payouts.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-5xl mx-auto text-center">
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.1}}>
                    <Users className="h-10 w-10 mx-auto text-chart-1" />
                    <AnimatedCounter to={120} suffix="+" />
                    <p className="text-muted-foreground mt-1">Active Drivers</p>
                </motion.div>
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.2}}>
                    <Award className="h-10 w-10 mx-auto text-chart-2" />
                    <AnimatedCounter to={95} suffix="%" />
                    <p className="text-muted-foreground mt-1">5-Star Ratings</p>
                </motion.div>
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.3}}>
                    <IndianRupee className="h-10 w-10 mx-auto text-chart-3" />
                    <AnimatedCounter to={15} suffix="%" />
                    <p className="text-muted-foreground mt-1">Higher Earnings</p>
                </motion.div>
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.4}}>
                    <Clock className="h-10 w-10 mx-auto text-chart-5" />
                    <h3 className="text-4xl font-bold mt-2">24/7</h3>
                    <p className="text-muted-foreground mt-1">Flexible Schedule</p>
                </motion.div>
            </div>

            <div className="mt-24 text-center">
              <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  className="font-headline text-3xl font-bold">Simple Steps to Start Earning
              </motion.h3>
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 [perspective:1000px]">
                  {onboardingSteps.map((step, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                      >
                          <div 
                              className="relative w-full h-72 [transform-style:preserve-3d] cursor-pointer"
                              onClick={() => handleFlip(index)}
                          >
                              <motion.div 
                                  className="absolute w-full h-full [backface-visibility:hidden] p-6 bg-card border rounded-lg flex flex-col items-center justify-center text-center"
                                  animate={{ rotateY: flippedStep === index ? -180 : 0 }}
                                  transition={{ duration: 0.6 }}
                              >
                                  <div className="mb-4 text-5xl font-bold text-muted-foreground/20 absolute top-4 left-4">{step.step}</div>
                                  <step.icon className="h-12 w-12 text-primary mb-4" />
                                  <h4 className="font-semibold text-lg">{step.title}</h4>
                              </motion.div>
                              
                              <motion.div 
                                  className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-6 bg-card border rounded-lg flex flex-col items-center justify-center text-center"
                                  animate={{ rotateY: flippedStep === index ? 0 : 180 }}
                                  transition={{ duration: 0.6 }}
                              >
                                  {step.title === "Upload Documents" ? (
                                    <div className="w-full space-y-4">
                                      <p className="text-sm text-muted-foreground">{step.description}</p>
                                      <div className="p-4 border-2 border-dashed rounded-lg text-center">
                                        <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                                        <p className="text-xs mt-1">Drag & Drop or Click</p>
                                      </div>
                                      <div className="space-y-2 text-left">
                                        <Label className="text-xs">Uploading License.pdf</Label>
                                        <Progress value={60} className="h-2" />
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                  )}
                              </motion.div>
                          </div>
                      </motion.div>
                  ))}
              </div>
            </div>

            <motion.div 
              className="mt-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button asChild size="lg" className="font-bold text-lg">
                <Link href="/signup?role=driver">Become a Driver Today</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="container mx-auto px-4 py-20 md:py-32">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
            >
                <h2 className="font-headline text-4xl font-bold">Frequently Asked Questions</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Everything you need to know about Rapido services.
                </p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-12 max-w-3xl mx-auto"
            >
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg text-left hover:no-underline">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
        </section>
        
        {/* Live Chat Widget */}
        <Link href="#faq" className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-110" aria-label="Open chat support">
            <MessageSquare className="h-6 w-6" />
        </Link>
      </main>

      <motion.footer 
        className="bg-muted/30 border-t"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                
                {/* Column 1: Company Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Logo />
                    <p className="text-sm text-muted-foreground">Your trusted ride in Mithilanchal. Safe, reliable, and culturally aware transportation.</p>
                    <div className="flex gap-4">
                        <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:scale-125"><Facebook /></a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:scale-125"><Instagram /></a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:scale-125"><Twitter /></a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:scale-125"><Linkedin /></a>
                    </div>
                </div>
                
                {/* Column 2: Quick Links */}
                <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                        <li><Link href="#safety" className="text-muted-foreground hover:text-primary">Safety</Link></li>
                        <li><Link href="#drive" className="text-muted-foreground hover:text-primary">Drive with Us</Link></li>
                        <li><Link href="/profile/safety" className="text-muted-foreground hover:text-primary">Support</Link></li>
                        <li><Link href="#faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                    </ul>
                </div>

                {/* Column 3: Contact Info */}
                <div>
                    <h4 className="font-semibold mb-4">Contact Us</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /><a href="tel:+919142277483" className="text-muted-foreground hover:text-primary">9142277483</a></li>
                        <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /><a href="mailto:royadityaa003@gmail.com" className="text-muted-foreground hover:text-primary">royadityaa003@gmail.com</a></li>
                        <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /><span className="text-muted-foreground">Darbhanga, Bihar, India</span></li>
                        <li className="flex items-start gap-3"><MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /><a href="https://wa.me/919142277483" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">WhatsApp Us</a></li>
                    </ul>
                </div>
                
                {/* Column 4: App Download & Newsletter */}
                <div className="space-y-8">
                    <div>
                        <h4 className="font-semibold mb-4">Get the App</h4>
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4">
                            <a href="#" className="inline-block transition-transform hover:scale-105" aria-label="Get it on Google Play">
                                <svg width="135" height="40" viewBox="0 0 135 40" fill="currentColor" className="text-foreground"><rect width="135" height="40" rx="6" fill="black"></rect><path d="M11.23 9.45H10.15L12.94 12.18L15.35 14.54L15.36 14.53L12.95 16.89L10.12 19.65H11.2L13.88 17.02L16.48 14.53L13.89 12.02L11.23 9.45Z M26.96 14.47L16.59 4.31C16.14 3.87 15.39 3.86 14.93 4.3L9.58 9.53L12.94 12.82L23.47 12.44L26.96 14.47ZM9.58 19.52L14.93 24.75C15.39 25.19 16.14 25.18 16.59 24.74L26.98 14.58L23.49 12.55L12.94 16.23L9.58 19.52Z M4.2 8.65C3.34 9.46 2.76 10.57 2.53 11.83L11.75 20.84L14.62 18.03L4.2 8.65Z M4.2 20.4L14.62 11.02L11.75 8.21L2.53 17.22C2.76 18.48 3.34 19.59 4.2 20.4Z" fill="white"></path><g><text x="36" y="15" fill="white" fontSize="12" fontFamily="Arial, sans-serif">GET IT ON</text><text x="36" y="30" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">Google Play</text></g></svg>
                            </a>
                            <a href="#" className="inline-block transition-transform hover:scale-105" aria-label="Download on the App Store">
                               <svg width="120" height="40" viewBox="0 0 120 40" fill="currentColor" className="text-foreground"><rect width="120" height="40" rx="6" fill="black"></rect><path d="M10.13,25.42a4,4,0,0,1,1.93-3.3,4.42,4.42,0,0,0-3.3-1.52c-2.09,0-3.81,1.48-4.83,1.48s-2.82-1.48-4.87-1.48-3.88,1.4-5,1.4a4.4,4.4,0,0,0-3.2,1.69,8.23,8.23,0,0,0-1.63,5.2,7.12,7.12,0,0,0,2.4,5.49,4,4,0,0,1-1.8,3.25,4.55,4.55,0,0,0,3.31,1.52c2.09,0,3.81-1.48,4.83-1.48s2.82,1.48,4.87,1.48,3.88-1.4,5-1.4A4.24,4.24,0,0,0,17.4,6.75Z" transform="translate(15.5 2.5) scale(0.6)" fill="white"></path><g><text x="44" y="15" fill="white" fontSize="10" fontFamily="Arial, sans-serif">Download on the</text><text x="44" y="30" fill="white" fontSize="16" fontWeight="600" fontFamily="Arial, sans-serif">App Store</text></g></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Stay Updated</h4>
                        <div className="overflow-hidden">
                            <AnimatePresence mode="wait">
                                {newsletterStatus !== 'success' ? (
                                    <motion.form 
                                        key="form"
                                        onSubmit={handleNewsletterSubmit} 
                                        className="flex gap-2"
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <Input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            required 
                                        />
                                        <Button type="submit" disabled={newsletterStatus === 'submitting'}>
                                            {newsletterStatus === 'submitting' ? '...' : <Send />}
                                        </Button>
                                    </motion.form>
                                ) : (
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-green-600 font-medium p-2 rounded-md bg-green-500/10 border border-green-500/20"
                                    >
                                        <CheckCircle /> Thank you for subscribing!
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
            
            <Separator className="my-12" />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Rapido Mithila. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                    <Select defaultValue="en" onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                          <div className="flex items-center gap-2"><Globe className="h-3 w-3" /><SelectValue placeholder="Language" /></div>
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                          <SelectItem value="mai">मैथिली (Maithili)</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
      </motion.footer>
    </div>
  );
}

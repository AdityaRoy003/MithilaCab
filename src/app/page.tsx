
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ChevronDown, MapPin, Menu, Quote, Car, Smartphone, Star, Wallet, X, Upload, Users, Award, IndianRupee, Clock, UserPlus, UploadCloud, ShieldCheck, Navigation, Facebook, Instagram, MessageSquare, Globe, Send, CheckCircle, ArrowRight, LifeBuoy } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';


// Reusable NavLink component for animated underline effect
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="group relative text-sm font-medium transition-colors hover:text-primary">
    {children}
    <span className="absolute bottom-[-4px] left-0 block h-0.5 w-full max-w-0 bg-primary transition-all duration-300 group-hover:max-w-full"></span>
  </Link>
);


export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'mithila-hero');
  const appScreenImage = PlaceHolderImages.find(img => img.id === 'app-screen-1');
  const madhubaniImages = PlaceHolderImages.filter(img => img.id.startsWith('madhubani-'));
  const mithilaMapImage = PlaceHolderImages.find(img => img.id === 'mithila-map');
  const testimonialImages = [
      PlaceHolderImages.find(img => img.id === 'testimonial-1'),
      PlaceHolderImages.find(img => img.id === 'testimonial-2')
  ].filter(Boolean);


  const headline = "Discover Mithila";
  const subHeadline = "One Ride at a Time";

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);


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
          quote: "MithilaCab makes it so easy to visit my family in the village. The drivers are always respectful and know all the local routes.",
          name: "Sanjay Kumar",
          role: "Frequent Rider, Darbhanga",
          image: testimonialImages[0]
      },
      {
          quote: "As a student, I rely on MithilaCab for my daily commute. It's affordable, safe, and always on time. It has made my life so much easier!",
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
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="font-bold">
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
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
              className="mt-4 max-w-xl mx-auto text-lg text-foreground/80"
              variants={itemVariants}
            >
              Your trusted partner for exploring the landmarks and culture of Mithila. Reliable, safe, and always on time.
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
                    <MapPin className="h-10 w-10 mx-auto text-primary"/>
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
                    <Car className="h-10 w-10 mx-auto text-primary"/>
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
                    <Smartphone className="h-10 w-10 mx-auto text-primary"/>
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
                    <Star className="h-10 w-10 mx-auto text-primary"/>
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
                <ShieldCheck className="h-12 w-12 mx-auto text-primary"/>
                <h3 className="mt-4 font-semibold text-xl">Verified Drivers</h3>
                <p className="mt-2 text-muted-foreground">All our drivers undergo a strict verification process, including background checks.</p>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="text-center p-8 h-full">
                <Navigation className="h-12 w-12 mx-auto text-primary"/>
                <h3 className="mt-4 font-semibold text-xl">Live Ride Tracking</h3>
                <p className="mt-2 text-muted-foreground">Share your ride status with family and friends. They can track your journey in real-time.</p>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Card className="text-center p-8 h-full">
                <MessageSquare className="h-12 w-12 mx-auto text-primary"/>
                <h3 className="mt-4 font-semibold text-xl">24/7 Support</h3>
                <p className="mt-2 text-muted-foreground">Our support team is available around the clock to assist you with any issues or emergencies.</p>
              </Card>
            </motion.div>
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
                <div className="absolute top-[35%] left-[40%]">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
                <div className="absolute top-[50%] left-[60%]">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping [animation-delay:0.5s]"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
                 <div className="absolute top-[25%] left-[75%]">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping [animation-delay:0.2s]"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
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
              <h2 className="font-headline text-4xl font-bold">Drive with MithilaCab</h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                  Join our growing community of drivers and earn on your own terms. We provide the tools and support you need to succeed.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-5xl mx-auto text-center">
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.1}}>
                    <Users className="h-10 w-10 mx-auto text-primary" />
                    <h3 className="text-4xl font-bold mt-2">120+</h3>
                    <p className="text-muted-foreground mt-1">Active Drivers</p>
                </motion.div>
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.2}}>
                    <Award className="h-10 w-10 mx-auto text-primary" />
                    <h3 className="text-4xl font-bold mt-2">95%</h3>
                    <p className="text-muted-foreground mt-1">5-Star Ratings</p>
                </motion.div>
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.3}}>
                    <IndianRupee className="h-10 w-10 mx-auto text-primary" />
                    <h3 className="text-4xl font-bold mt-2">15%</h3>
                    <p className="text-muted-foreground mt-1">Higher Earnings</p>
                </motion.div>
                <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{ once: true }} transition={{duration: 0.5, delay: 0.4}}>
                    <Clock className="h-10 w-10 mx-auto text-primary" />
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
                                  <div className="mb-4 text-5xl font-bold text-primary/10 absolute top-4 left-4">{step.step}</div>
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
                <Link href="/signup">Become a Driver Today</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-muted/40 border-t">
        <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Column 1: Logo & Socials */}
                <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Logo />
                    <p className="text-sm text-muted-foreground">Connecting Mithila, one ride at a time. Safe, reliable, and culturally aware transportation.</p>
                    <div className="flex gap-4">
                        <motion.a href="#" initial={{ opacity: 0}} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}><Facebook className="text-muted-foreground hover:text-primary"/></motion.a>
                        <motion.a href="#" initial={{ opacity: 0}} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}><Instagram className="text-muted-foreground hover:text-primary"/></motion.a>
                        <motion.a href="#" initial={{ opacity: 0}} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}><MessageSquare className="text-muted-foreground hover:text-primary"/></motion.a>
                    </div>
                </motion.div>

                {/* Column 2: Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                        <li><Link href="#how-it-works" className="text-muted-foreground hover:text-primary">How It Works</Link></li>
                        <li><Link href="#drive" className="text-muted-foreground hover:text-primary">Drive with Us</Link></li>
                        <li><Link href="/login" className="text-muted-foreground hover:text-primary">Login</Link></li>
                    </ul>
                </motion.div>

                {/* Column 3: Newsletter & Language */}
                <motion.div 
                    className="md:col-span-2 space-y-4"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h4 className="font-semibold">Stay Updated</h4>
                    <p className="text-sm text-muted-foreground">Subscribe to our newsletter for the latest news and offers.</p>
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
                                        {newsletterStatus === 'submitting' ? 'Submitting...' : <Send />}
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
                    <div className="pt-4">
                        <Label className="font-semibold">Language</Label>
                        <Select defaultValue="en" onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[180px] mt-2">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Language" />
                            </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                                <SelectItem value="mai">मैथिली (Maithili)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>
            </div>
            <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} MithilaCab. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

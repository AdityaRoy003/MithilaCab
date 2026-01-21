'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'mithila-hero');
  const appScreenImage = PlaceHolderImages.find(img => img.id === 'app-screen-1');

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
        staggerChildren: 0.1,
      },
    },
  };
  
  // Staggered animation for each word in the headline
  const wordVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } }
  };
  
  // Animation for the paragraph and search bar
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
        y: 0, 
        opacity: 1, 
        transition: { type: 'spring', stiffness: 100, damping: 12, delay: 0.8 } 
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#safety" className="text-sm font-medium hover:text-primary transition-colors">Safety</Link>
            <Link href="#drive" className="text-sm font-medium hover:text-primary transition-colors">Drive with Us</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="font-bold">
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section ref={heroRef} className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          {heroImage && (
              <motion.div 
                className="absolute inset-0 w-full h-[150%] -top-[25%]"
                style={{ y: backgroundY }}
              >
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  objectFit="cover"
                  quality={100}
                  priority
                  className="absolute inset-0 w-full h-full object-cover dark:brightness-50"
                  data-ai-hint={heroImage.imageHint}
                />
              </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
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
              <form action="/login" className="flex gap-2 bg-background p-2 rounded-full shadow-lg border">
                <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      name="destination"
                      placeholder="Enter your destination..."
                      className="h-12 w-full rounded-full border-none pl-12 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <Button 
                    type="submit" 
                    size="lg" 
                    className="rounded-full font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/40"
                >
                  Find a Ride
                </Button>
              </form>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5, ease: "easeInOut"}}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
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
      </main>
      
      <footer className="bg-muted">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
             <p>&copy; {new Date().getFullYear()} MithilaCab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

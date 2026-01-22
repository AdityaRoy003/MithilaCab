'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ChevronDown, MapPin, Menu, Quote, Car, Smartphone, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// Reusable NavLink component for animated underline effect
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="group relative text-sm font-medium transition-colors hover:text-primary">
    {children}
    <span className="absolute bottom-[-4px] left-0 block h-0.5 w-full max-w-0 bg-primary transition-all duration-300 group-hover:max-w-full"></span>
  </Link>
);


export default function LandingPage() {
  // Hardcode image URLs directly in the component
  const heroImage = {
    imageUrl: "https://images.unsplash.com/photo-1618828232323-8d264a619082",
    description: "A vibrant and intricate Madhubani painting, showcasing the rich artistic heritage of the Mithila region.",
    imageHint: "Madhubani painting"
  };
  const appScreenImage = {
    imageUrl: "https://images.unsplash.com/photo-1730818877052-c360a791e058",
    description: "A screenshot or mock-up of the MithilaCab app's main booking screen.",
    imageHint: "app screen"
  };
  const madhubaniImages = [
    {
      imageUrl: "https://images.unsplash.com/photo-1627843229743-f42194412c75",
      description: "A detailed Madhubani painting of fish and nature.",
      imageHint: "madhubani painting"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1632313079815-5a507315579d",
      description: "A traditional Madhubani artwork with human figures.",
      imageHint: "traditional art"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1634565334816-a32d66df5f80",
      description: "Colorful folk painting from the Mithila region.",
      imageHint: "folk painting"
    }
  ];
  const mithilaMapImage = {
    imageUrl: "https://images.unsplash.com/photo-1594398932026-f78077750431",
    description: "A stylized map of India with regions highlighted.",
    imageHint: "india map"
  };
  const testimonialImages = [
      {
          id: 'testimonial-1',
          imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19",
          imageHint: "local man"
      },
      {
          id: 'testimonial-2',
          imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          imageHint: "local woman"
      }
  ];


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

  const [scrolled, setScrolled] = useState(false);

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
                            <Image
                              src={image.imageUrl}
                              alt={image.description}
                              width={600}
                              height={600}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              data-ai-hint={image.imageHint}
                            />
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
        <section id="drive" className="py-20 md:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="font-headline text-4xl font-bold">Drive with MithilaCab</h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Earn on your own schedule. Join our community of drivers and start making money with your car.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-8 font-bold text-secondary-foreground">
                <Link href="/signup">Become a Driver</Link>
              </Button>
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

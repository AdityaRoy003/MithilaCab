import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mithila गाड़ी - Bike Taxi, Auto, Cab & Parcel',
  description: "Bharat's favorite ride-hailing & parcel delivery app for Mithilanchal",
  icons: {
    icon: [
      { url: '/icon.svg?v=3', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=3', sizes: '32x32' },
      { url: '/icon.png?v=3', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${inter.variable} ${lexend.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png?v=3" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

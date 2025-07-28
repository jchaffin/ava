import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components";
import Layout from "@/components/Layout";

const geistSans = Geist({
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "AVA - Premium Skincare Products",
    template: "%s | AVA"
  },
  description: "Discover your perfect beauty routine with AVA's premium collection of scientifically-formulated skincare products designed for radiant, healthy skin.",
  keywords: ["skincare", "beauty", "serum", "anti-aging", "hydration", "vitamin c", "collagen"],
  authors: [{ name: "AVA Team" }],
  creator: "AVA",
  publisher: "AVA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ava.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ava.com',
    title: 'AVA - Premium Skincare Products',
    description: 'Transform your skincare journey with our premium collection of scientifically-formulated products.',
    siteName: 'AVA',
    images: [
      {
        url: '/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'AVA Premium Skincare Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVA - Premium Skincare Products',
    description: 'Transform your skincare journey with our premium collection of scientifically-formulated products.',
    images: ['/images/logos/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.className} ${geistMono.className}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-theme-primary text-theme-primary" suppressHydrationWarning>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}

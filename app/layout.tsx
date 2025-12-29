import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code39 Barcode Generator | AI-Powered by Claude",
  description: "Generate professional Code39 barcodes with AI-powered configuration. Create custom barcode labels for inventory, assets, and products. Built with Next.js and Claude AI by Matt Hicks.",
  keywords: ["barcode generator", "code39", "barcode labels", "inventory labels", "asset tags", "AI barcode", "Claude AI"],
  authors: [{ name: "Matt Hicks" }],
  creator: "Matt Hicks",
  publisher: "Matt Hicks",
  metadataBase: new URL('https://barcode.mght630.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Code39 Barcode Generator | AI-Powered",
    description: "Generate professional Code39 barcodes with AI-powered configuration using Claude. Perfect for inventory, assets, and product labels.",
    url: "https://barcode.mght630.com",
    siteName: "Code39 Barcode Generator",
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Code39 Barcode Generator - AI-Powered by Claude',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Code39 Barcode Generator | AI-Powered",
    description: "Generate professional Code39 barcodes with AI assistance. Built with Next.js and Claude AI.",
    images: ['/og-image.svg'],
    creator: '@mattghicks',
  },
  icons: {
    icon: [
      { url: '/barcode-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/barcode-icon.svg', type: 'image/svg+xml' },
    ],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

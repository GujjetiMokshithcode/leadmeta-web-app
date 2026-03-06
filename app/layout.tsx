import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://leadmeta.me'),
  title: {
    default: 'Leadmeta - Home For All B2C Leads And B2B Leads',
    template: '%s | Leadmeta',
  },
  description: 'Discover B2B and B2C leads instantly. AI-powered email finder that extracts verified business emails from Google search. Build your prospect list in seconds.',
  keywords: ['B2B leads', 'B2C leads', 'email finder', 'lead generation', 'sales leads', 'prospecting', 'business emails', 'lead discovery', 'AI lead generation'],
  authors: [{ name: 'Leadmeta' }],
  creator: 'Leadmeta',
  publisher: 'Leadmeta',
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
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/logo-icon.png', sizes: '32x32' },
    ],
    apple: '/logo-icon.png',
    shortcut: '/logo-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://leadmeta.me',
    siteName: 'Leadmeta',
    title: 'Leadmeta - Home For All B2C Leads And B2B Leads',
    description: 'Discover B2B and B2C leads instantly. AI-powered email finder that extracts verified business emails from Google search.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Leadmeta - B2B and B2C Lead Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leadmeta',
    description: 'Discover B2B and B2C leads instantly. AI-powered email finder that extracts verified business emails.',
    images: ['/logo.png'],
    creator: '@leadmeta',
  },
  alternates: {
    canonical: 'https://leadmeta.me',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster theme="dark" position="top-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}

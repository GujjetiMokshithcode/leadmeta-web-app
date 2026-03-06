import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
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
    default: 'Leadmeta – B2B Lead Generation Tool',
    template: '%s | Leadmeta',
  },
  description: 'Find and manage B2B leads effortlessly with Leadmeta. Automate outreach, track results, and grow faster.',
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
    title: 'Leadmeta – B2B Lead Generation Tool',
    description: 'Find and manage B2B leads effortlessly.',
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
    description: 'B2B Lead Generation Made Easy',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Leadmeta',
              url: 'https://leadmeta.me',
              description: 'B2B Lead Generation and Sales Automation Tool',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'Leadmeta',
                url: 'https://leadmeta.me',
              },
            }),
          }}
        />
        {children}
        <Toaster theme="dark" position="top-right" richColors closeButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

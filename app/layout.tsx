import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Leadmeta - Lead Discovery SaaS',
  description: 'Extract business emails from Google search results in seconds. Find decision makers and build your prospect list effortlessly.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo-icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/logo-icon.png',
        sizes: '32x32',
      },
    ],
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'Leadmeta - Lead Discovery SaaS',
    description: 'Extract business emails from Google search results in seconds.',
    images: ['/logo.png'],
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
        <Analytics />
      </body>
    </html>
  )
}

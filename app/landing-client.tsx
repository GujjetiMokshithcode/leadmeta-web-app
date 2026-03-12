'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LandingSearchInput } from '@/components/ui/landing-search-input';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], style: 'italic', weight: '600' });

export function LandingClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (message: string, targetCount: number) => {
    if (!message.trim()) return;
    setIsLoading(true);

    const params = new URLSearchParams({
      q: message,
      mode: 'ai',
      target: targetCount.toString()
    });

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="bg-[#050505] flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Animated Background - Covers entire page */}
      <div className="absolute inset-0 opacity-80 pointer-events-none z-0">
        <AnimatedBackground />
      </div>

      {/* Hero Section */}
      <main className="flex-1 relative flex items-center justify-center px-4 pt-16 z-10">
        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-10 py-20">
          {/* Brand + SEO Title */}
          <div className="text-center">
            <p className="text-5xl sm:text-6xl mb-3" aria-hidden="true">
              <span className="font-extrabold text-white tracking-tight">Lead</span>
              <span className={`${playfair.className} text-white/90`}>meta</span>
            </p>
            <h1 className="text-lg sm:text-xl text-white/50 font-medium max-w-2xl mx-auto">
              Find Verified B2B &amp; B2C Emails in Seconds — AI-Powered Lead Search
            </h1>
          </div>

          {/* Search Input */}
          <div className="w-full">
            <h2 className="sr-only">Search for Leads</h2>
            <LandingSearchInput
              onSubmit={handleSubmit}
              placeholder="Describe the leads you're looking for..."
              disabled={isLoading}
              models={[
                { id: 'ai', name: 'AI Search', description: 'Generate & search automatically' },
                { id: 'manual', name: 'Manual', description: 'Use your own search query' },
              ]}
              defaultModel="ai"
            />
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-10 bg-transparent">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/30">
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-white/60 transition-colors">
              Blog
            </Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
          </div>
          <span className="hidden sm:inline">|</span>
          <p>&copy; {new Date().getFullYear()} Leadmeta. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

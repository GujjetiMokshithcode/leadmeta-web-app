'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LandingSearchInput } from '@/components/ui/landing-search-input';
import { AnimatedBackground } from '@/components/ui/animated-background';

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
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl mb-4">
              <span className="font-bold text-white">Lead</span>
              <span className="font-light italic text-white/80">meta</span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Stop wasting hours on cold lead research. Leadmeta instantly finds and extracts verified B2B &amp; B2C emails from across the web — powered by AI. Perfect for sales teams, freelancers, and growth hackers who want more replies, less grinding.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full">
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

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              AI-Powered Queries
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              Email Verification
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              CSV Export
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              No Credit Card Required
            </span>
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

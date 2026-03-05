'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LandingSearchInput } from '@/components/ui/landing-search-input';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function Home() {
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
    <div className="bg-[#050505] flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Hero Section */}
      <main className="min-h-screen relative flex items-center justify-center px-4 pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <AnimatedBackground />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-10 py-20">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl mb-4">
              <span className="font-bold text-white">Lead</span>
              <span className="font-light italic text-white/80">meta</span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Discover business emails from Google search results in seconds. 
              AI-powered lead generation for modern sales teams.
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
      <footer className="relative z-10 py-6 border-t border-white/10 bg-transparent backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/40">
          <div className="flex items-center gap-6">
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
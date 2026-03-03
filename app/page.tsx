'use client';

import { useRouter } from 'next/navigation';
import { HeroWave } from '@/components/ui/ai-input-hero';

export default function Home() {
  const router = useRouter();

  const handleSearch = (input: string, count: number, mode: 'ai' | 'manual') => {
    if (!input.trim()) return;
    
    // Navigate to dashboard with query params
    const params = new URLSearchParams({
      q: input,
      mode,
      target: count.toString()
    });
    
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroWave 
        title="Leadmeta Engine"
        subtitle="AI-powered lead discovery for modern sales teams"
        placeholder="e.g., 'CTOs at Series A fintech startups in Berlin'"
        onPromptSubmit={handleSearch}
      />
    </main>
  );
}
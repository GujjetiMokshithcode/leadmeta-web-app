'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClaudeStyleChatInput } from '@/components/ui/claude-style-chat-input';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (message: string) => {
    if (!message.trim()) return;
    setIsLoading(true);
    
    const params = new URLSearchParams({
      q: message,
      mode: 'ai',
      target: '50'
    });
    
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] relative flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f3dbc]/10 via-[#050505] to-[#050505]" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-10">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl">
          <span className="font-bold text-white">Lead</span>
          <span className="font-light italic text-white/80">meta</span>
        </h1>

        {/* Chat Input - Bigger */}
        <div className="w-full">
          <ClaudeStyleChatInput
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
  );
}
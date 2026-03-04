'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResultsTable from '@/components/results-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { 
  ArrowLeft, 
  Send,
  Bot,
  User,
  Target,
  Mail,
  Play,
  X,
  Loader2
} from 'lucide-react';

interface EmailResult {
  email: string;
  source: string;
  extractedFrom?: 'title' | 'snippet' | 'url';
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'strategies' | 'results' | 'progress';
  data?: any;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTarget = parseInt(searchParams.get('target') || '50');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [pendingQueries, setPendingQueries] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(initialTarget);
  const [isSearching, setIsSearching] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleUserMessage(initialQuery);
    }
  }, [initialQuery]);

  const addMessage = (role: 'user' | 'assistant', content: string, type: Message['type'] = 'text', data?: any) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, type, data }]);
  };

  const handleUserMessage = async (message: string) => {
    addMessage('user', message);
    setIsLoading(true);

    try {
      addMessage('assistant', 'Thinking...', 'progress');
      
      const response = await fetch('/api/generate-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
      });

      const data = await response.json();
      
      setMessages(prev => prev.filter(m => m.type !== 'progress'));
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate strategies');

      setPendingQueries(data.queries);
      addMessage('assistant', `I've analyzed your request and generated ${data.queries.length} search strategies.`, 'strategies', data.queries);
    } catch (err) {
      setMessages(prev => prev.filter(m => m.type !== 'progress'));
      addMessage('assistant', err instanceof Error ? err.message : 'An error occurred', 'text');
    } finally {
      setIsLoading(false);
    }
  };

  const startDiscovery = async () => {
    if (pendingQueries.length === 0) return;
    
    setIsSearching(true);
    addMessage('assistant', `Starting search with ${pendingQueries.length} strategies. Target: ${targetCount} leads.`, 'progress');

    const emailsSet = new Set<string>();
    const allEmails: EmailResult[] = [];
    const MAX_PAGES_PER_QUERY = 50;
    const PAGE_SIZE = 20;

    try {
      for (const query of pendingQueries) {
        if (emailsSet.size >= targetCount) break;

        let page = 1;
        let consecutiveZeroPages = 0;

        while (page <= MAX_PAGES_PER_QUERY && emailsSet.size < targetCount) {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, page, num: PAGE_SIZE }),
          });

          const data = await response.json();
          if (!response.ok) break;

          let newEmails = 0;
          if (data.emails) {
            data.emails.forEach((result: EmailResult) => {
              const normalized = result.email.toLowerCase();
              if (!emailsSet.has(normalized)) {
                emailsSet.add(normalized);
                allEmails.push({ ...result, email: normalized });
                newEmails++;
              }
            });
          }

          if (newEmails > 0) {
            setCollectedCount(emailsSet.size);
            setResults([...allEmails]);
          } else {
            consecutiveZeroPages++;
          }

          if (data.organicCount === 0 || consecutiveZeroPages >= 5) break;
          page++;
          await new Promise(r => setTimeout(r, 400));
        }
      }

      setMessages(prev => prev.filter(m => m.type !== 'progress'));
      addMessage('assistant', `Found ${emailsSet.size} verified emails.`, 'results', allEmails);
    } catch (err) {
      addMessage('assistant', 'Search failed. Please try again.', 'text');
    } finally {
      setIsSearching(false);
      setPendingQueries([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleUserMessage(input);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[#050505] relative flex flex-col overflow-hidden">
      {/* Animated Shader Background */}
      <div className="absolute inset-0 opacity-40">
        <ShaderAnimation />
      </div>
      
      {/* Header */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-4xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-white/60 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Target className="h-4 w-4" />
              <span>{collectedCount} / {targetCount}</span>
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea ref={scrollRef} className="flex-1 container mx-auto px-4 max-w-4xl py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Bot className="h-8 w-8 text-white/60" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">How can I help you find leads?</h2>
            <p className="text-white/40 max-w-md">
              Describe your target audience and I'll search the web to find verified email addresses.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-white/10' 
                    : 'bg-white/5'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white/60" />
                  )}
                </div>
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.type === 'strategies' ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-white/80 mb-4">{message.content}</p>
                      <div className="space-y-2 mb-4">
                        {message.data?.map((q: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/30 text-sm text-white/60">
                            <span className="text-white/40 font-mono">{i + 1}</span>
                            <code className="flex-1 text-left truncate">{q}</code>
                            <button 
                              onClick={() => setPendingQueries(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-white/30 hover:text-white/60"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPendingQueries([])}
                          className="border-white/10 bg-transparent hover:bg-white/5 text-white/60"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={startDiscovery}
                          disabled={isSearching}
                          className="bg-white/10 hover:bg-white/15 text-white border border-white/20"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Search
                        </Button>
                      </div>
                    </div>
                  ) : message.type === 'results' ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/80">{message.content}</p>
                      </div>
                      <ResultsTable results={message.data} query="Search Results" />
                    </div>
                  ) : message.type === 'progress' ? (
                    <div className="flex items-center gap-3 text-white/50">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <div className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-white/5 border border-white/10 text-white/80'
                    }`}>
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-black/30 backdrop-blur-xl p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the leads you're looking for..."
                disabled={isLoading || isSearching}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-12 h-12"
              />
            </div>
            <Button 
              type="submit"
              disabled={!input.trim() || isLoading || isSearching}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 h-12 px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

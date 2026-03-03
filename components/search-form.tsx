'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Terminal, ArrowRight } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string, targetCount: number, mode: 'ai' | 'manual') => Promise<void>;
  loading: boolean;
  logs: string[];
  collectedCount: number;
}

export default function SearchForm({ onSearch, loading, logs, collectedCount }: SearchFormProps) {
  const [prompt, setPrompt] = useState('');
  const [targetCount, setTargetCount] = useState(50);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && prompt.trim()) {
      onSearch(prompt, targetCount, mode);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-full border border-border">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'ai' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            AI Agent
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'manual' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="h-3 w-3" />
            Manual
          </button>
        </div>
      </div>

      <div className="relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className={`p-4 border-2 transition-colors bg-card/50 backdrop-blur ${mode === 'ai' ? 'border-primary/20' : 'border-blue-500/20'}`}>
            <textarea
              placeholder={mode === 'ai' 
                ? "Describe your goal, e.g., 'Leads for London SaaS founders'" 
                : "Enter a specific search query, e.g., site:linkedin.com/in/ 'CEO' '@gmail.com'"}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent border-none focus:outline-none text-base resize-none min-h-[80px] py-2 shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-border px-3 py-1 rounded-md bg-background">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Target</span>
                  <input
                    type="number"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                    className="w-12 bg-transparent text-sm font-bold focus:outline-none"
                    disabled={loading}
                  />
                </div>
                {loading && collectedCount > 0 && (
                  <Badge variant="outline" className="animate-pulse bg-primary/10 text-primary border-primary/20">
                    Active: {collectedCount} / {targetCount}
                  </Badge>
                )}
              </div>
              <Button 
                disabled={loading || !prompt.trim()} 
                className={`rounded-full px-6 font-bold ${mode === 'manual' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-primary text-primary-foreground'}`}
              >
                {loading ? 'Processing...' : mode === 'ai' ? 'Generate Strategies' : 'Start Extraction'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </form>

        {logs.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className={`h-2 w-2 rounded-full animate-pulse ${mode === 'ai' ? 'bg-primary' : 'bg-blue-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">System Logs</span>
            </div>
            <ScrollArea className="h-64 rounded-xl border border-border bg-card shadow-inner">
              <div ref={terminalRef} className="p-4 font-mono text-xs leading-relaxed">
                {logs.map((log, idx) => (
                  <div key={idx} className="mb-2 opacity-60 hover:opacity-100 transition-opacity flex gap-3">
                    <span className={`shrink-0 font-bold ${mode === 'ai' ? 'text-primary' : 'text-blue-500'}`}>»</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

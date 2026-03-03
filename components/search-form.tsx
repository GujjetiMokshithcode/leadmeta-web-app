'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchFormProps {
  onSearch: (query: string, targetCount: number) => Promise<void>;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [targetCount, setTargetCount] = useState(50);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollectedCount(0);
    setLogs([]);
    setShowDebug(true);
    await onSearch(query, targetCount);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && (e.target as HTMLInputElement).id === 'search') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleTargetCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 0;
    if (value > 500) value = 500;
    if (value < 1) value = 1;
    setTargetCount(value);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
            Search for leads
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Enter keywords, company names, or job titles to extract business emails
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            id="search"
            type="text"
            placeholder="e.g., 'senior marketing manager at tech companies'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 bg-background text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Searching...
              </span>
            ) : (
              'Extract'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="target" className="block text-sm font-medium text-foreground mb-2">
              Target Email Count
            </label>
            <Input
              id="target"
              type="number"
              min="1"
              max="500"
              value={targetCount}
              onChange={handleTargetCountChange}
              disabled={loading}
              className="bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Min: 1, Max: 500</p>
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-sm font-medium text-foreground">
              Collected: <span className="text-primary">{collectedCount}</span> / {targetCount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
          <div>💼 Find decision makers</div>
          <div>📧 Extract emails instantly</div>
          <div>📊 Build prospect lists</div>
        </div>

        {/* Debug Terminal */}
        <div>
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-primary hover:text-primary/80 mb-2"
          >
            {showDebug ? '▼' : '▶'} Debug Terminal
          </button>
          {showDebug && (
            <div
              ref={terminalRef}
              className="w-full max-h-64 overflow-y-auto rounded border border-border bg-black p-4 font-mono text-sm text-green-400"
              style={{
                backgroundColor: '#0A0A0A',
                borderColor: '#2A2B2E',
                color: '#00FF90',
              }}
            >
              {logs.length === 0 ? (
                <div className="text-muted-foreground">Logs will appear here...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

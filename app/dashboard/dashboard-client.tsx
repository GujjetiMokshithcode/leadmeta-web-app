'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import ResultsTable from '@/components/results-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedBackground } from '@/components/ui/animated-background';
import {
  ArrowLeft,
  Target,
  Play,
  X,
  Loader2,
  Search,
  Clock,
  Pencil,
  Sparkles
} from 'lucide-react';

interface EmailResult {
  email: string;
  source: string;
  extractedFrom?: 'title' | 'snippet' | 'url';
}

interface SearchResponse {
  success: boolean;
  emails: EmailResult[];
  totalFound: number;
  organicCount: number;
  query: string;
  error?: string;
}

type ViewState = 'input' | 'strategies' | 'searching' | 'results';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTarget = parseInt(searchParams.get('target') || '50');

  const [viewState, setViewState] = useState<ViewState>('input');
  const [results, setResults] = useState<EmailResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [collectedCount, setCollectedCount] = useState(0);
  const [pendingQueries, setPendingQueries] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(initialTarget);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [editingQuery, setEditingQuery] = useState<{ index: number; text: string } | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Auto-start if query provided
  useEffect(() => {
    if (initialQuery && viewState === 'input') {
      generateStrategies(initialQuery);
    }
  }, [initialQuery]);

  const generateStrategies = async (input: string) => {
    if (!input.trim()) return;

    setLoading(true);
    setQuery(input);

    try {
      const response = await fetch('/api/generate-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate search queries');

      if (!data.queries || data.queries.length === 0) {
        toast.warning('AI returned no queries. Try rephrasing your search.');
        return;
      }

      setPendingQueries(data.queries);
      setViewState('strategies');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to generate search strategies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startSearch = async () => {
    if (pendingQueries.length === 0) return;

    setViewState('searching');
    const searchStartTime = Date.now();
    setStartTime(searchStartTime);

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

          const data: SearchResponse = await response.json();
          if (!response.ok) {
            toast.error(data.error || `Search failed for query: "${query.slice(0, 40)}..."`);
            break;
          }

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

      const endTime = Date.now();
      setSearchTime(Math.round((endTime - searchStartTime) / 1000));

      if (allEmails.length === 0) {
        toast.warning('No leads found. Try different search terms or broader queries.');
        setViewState('strategies');
      } else {
        toast.success(`Found ${allEmails.length} leads!`);
        setViewState('results');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Search failed unexpectedly. Please try again.');
      setViewState('strategies');
    }
  };

  const handleNewSearch = () => {
    setViewState('input');
    setResults([]);
    setPendingQueries([]);
    setCollectedCount(0);
    setQuery('');
    setSearchTime(0);
  };

  const handleEditQuery = async () => {
    if (!editingQuery || !editPrompt.trim()) return;

    setIsEditing(true);
    try {
      const response = await fetch('/api/edit-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: pendingQueries,
          instruction: editPrompt
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to edit queries');

      setPendingQueries(data.queries);
      setEditingQuery(null);
      setEditPrompt('');
      toast.success('Queries updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to edit queries. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  // Input View
  if (viewState === 'input') {
    return (
      <div className="min-h-screen bg-[#050505] relative flex items-center justify-center px-4">
        <div className="absolute inset-0 opacity-60">
          <AnimatedBackground />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <button
            onClick={() => router.push('/')}
            className="absolute -top-16 left-0 flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="relative w-48 h-16 mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="Leadmeta – Find Verified B2B & B2C Emails in Seconds"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-white/40">Enter your search query</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="e.g., CTOs at fintech startups..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateStrategies(query)}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 text-lg"
              />
              <Button
                onClick={() => generateStrategies(query)}
                disabled={!query.trim() || loading}
                className="h-14 px-6 bg-white text-black hover:bg-white/90 font-medium"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            {/* Target Count Selector */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white/40" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Target Leads</div>
                  <div className="text-xs text-white/40">Stop searching after finding this many</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value))}
                  className="w-32 accent-white"
                />
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={targetCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 50;
                      setTargetCount(Math.min(Math.max(val, 10), 500));
                    }}
                    className="w-14 bg-transparent text-white text-center font-medium focus:outline-none"
                  />
                  <span className="text-white/40 text-sm">leads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Strategies View
  if (viewState === 'strategies') {
    return (
      <div className="min-h-screen bg-[#050505] relative flex items-center justify-center px-4">
        <div className="absolute inset-0 opacity-60">
          <AnimatedBackground />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <button
            onClick={handleNewSearch}
            className="absolute -top-16 left-0 flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-10">
                  <Image
                    src="/logo.png"
                    alt="Leadmeta"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Search Strategies</h2>
                  <p className="text-sm text-white/50">Review and approve the AI-generated queries</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Target className="h-5 w-5 text-white/40" />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {pendingQueries.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 group"
                >
                  <span className="text-white/30 font-mono text-sm w-6">{i + 1}</span>
                  <code className="flex-1 text-sm text-white/70 truncate">{q}</code>
                  <button
                    onClick={() => setPendingQueries(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-white/30 hover:text-white/60 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <Target className="h-4 w-4 text-white/40" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Target:</span>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={targetCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 50;
                        setTargetCount(Math.min(Math.max(val, 10), 500));
                      }}
                      className="w-14 bg-transparent text-white text-sm font-medium focus:outline-none text-center"
                    />
                    <span className="text-sm text-white/40">leads</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingQuery({ index: -1, text: '' })}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit All
                </button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleNewSearch}
                  className="border-white/20 bg-transparent hover:bg-white/5 text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startSearch}
                  className="bg-white text-black hover:bg-white/90 font-medium px-6"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit All Queries Dialog */}
        {editingQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white/60" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Edit All Queries</h3>
                  <p className="text-sm text-white/50">Describe changes to apply to all {pendingQueries.length} queries</p>
                </div>
              </div>

              <div className="mb-4 max-h-32 overflow-y-auto space-y-1">
                {pendingQueries.map((q, i) => (
                  <div key={i} className="text-xs text-white/40 truncate">
                    {i + 1}. {q}
                  </div>
                ))}
              </div>

              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., 'Target only Gmail addresses' or 'Add California location to all' or 'Focus on CTOs instead of CEOs'"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 resize-none outline-none focus:border-white/20 min-h-[100px] mb-4"
                autoFocus
              />

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingQuery(null);
                    setEditPrompt('');
                  }}
                  className="border-white/20 bg-transparent hover:bg-white/5 text-white/70"
                  disabled={isEditing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditQuery}
                  disabled={!editPrompt.trim() || isEditing}
                  className="bg-white text-black hover:bg-white/90 font-medium"
                >
                  {isEditing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Updating...' : 'Update All'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Searching View
  if (viewState === 'searching') {
    return (
      <div className="min-h-screen bg-[#050505] relative flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <AnimatedBackground />
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
            <Loader2 className="h-10 w-10 text-white/60 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Searching...</h2>
          <p className="text-white/50 mb-6">Found {collectedCount} leads so far</p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/40">
            <Clock className="h-4 w-4" />
            <span>Elapsed: {Math.round((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="container mx-auto px-4 max-w-5xl py-6">
        {/* Top Bar */}
        <div className="flex items-center gap-6 mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/50">{results.length} leads</span>
            <span className="text-white/30">•</span>
            <span className="text-white/50">{searchTime}s</span>
          </div>
        </div>

        {/* Results Table */}
        <ResultsTable results={results} query={query} />
      </div>
    </div>
  );
}

export function DashboardClient() {
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

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResultsTable from '@/components/results-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Target,
  Mail,
  Play,
  X,
  Loader2,
  Search,
  Download
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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTarget = parseInt(searchParams.get('target') || '50');

  const [results, setResults] = useState<EmailResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [collectedCount, setCollectedCount] = useState(0);
  const [pendingQueries, setPendingQueries] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(initialTarget);
  const [currentPage, setCurrentPage] = useState(0);

  // Auto-start if query provided
  useEffect(() => {
    if (initialQuery && results.length === 0 && !loading && !isSearching) {
      handleSearch(initialQuery, initialTarget);
    }
  }, [initialQuery]);

  const handleSearch = async (input: string, count: number) => {
    if (!input.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(input);
    setTargetCount(count);
    setResults([]);
    setCollectedCount(0);
    setPendingQueries([]);

    try {
      const genResponse = await fetch('/api/generate-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const genData = await genResponse.json();
      if (!genResponse.ok) throw new Error(genData.error || 'AI generation failed');

      setPendingQueries(genData.queries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startDiscovery = async () => {
    if (pendingQueries.length === 0) return;
    
    setIsSearching(true);
    setError(null);
    
    const emailsSet = new Set<string>(results.map(r => r.email));
    const allEmails: EmailResult[] = [...results];
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
          if (!response.ok) break;

          let newEmailsThisPage = 0;
          if (data.emails && data.emails.length > 0) {
            data.emails.forEach((result: EmailResult) => {
              const normalizedEmail = result.email.toLowerCase();
              if (!emailsSet.has(normalizedEmail)) {
                emailsSet.add(normalizedEmail);
                newEmailsThisPage++;
                allEmails.push({
                  email: normalizedEmail,
                  source: result.source,
                  extractedFrom: result.extractedFrom,
                });
              }
            });

            if (newEmailsThisPage > 0) {
              setCollectedCount(emailsSet.size);
              setResults([...allEmails]);
              consecutiveZeroPages = 0;
            } else {
              consecutiveZeroPages++;
            }
          } else {
            consecutiveZeroPages++;
          }

          if (data.organicCount === 0) break;
          if (consecutiveZeroPages >= 5) break;

          page++;
          setCurrentPage(page);
          await new Promise((res) => setTimeout(res, 400));
        }
      }

      setPendingQueries([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during discovery');
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewSearch = () => {
    setResults([]);
    setPendingQueries([]);
    setCollectedCount(0);
    setError(null);
    setQuery('');
  };

  const exportCSV = () => {
    const csv = results.map(r => `${r.email},${r.source}`).join('\n');
    const blob = new Blob([`Email,Source\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-white/10"></div>
            <span className="text-xl">
              <span className="font-bold">Lead</span>
              <span className="font-light italic text-white/70">meta</span>
            </span>
          </div>
          
          {results.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportCSV}
              className="border-white/20 bg-transparent hover:bg-white/5 text-white/80"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-white/50 mb-2 block">Search Query</label>
              <Input
                placeholder="Enter your search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, targetCount)}
                disabled={isSearching}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
              />
            </div>
            <div className="w-32">
              <label className="text-sm text-white/50 mb-2 block">Target</label>
              <Input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                disabled={isSearching}
                className="bg-white/5 border-white/10 text-white h-12"
              />
            </div>
            <Button 
              onClick={() => handleSearch(query, targetCount)}
              disabled={!query.trim() || loading || isSearching}
              className="h-12 px-6 bg-white/10 hover:bg-white/15 text-white border border-white/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Stats */}
        {(isSearching || results.length > 0 || loading) && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm">Target</span>
              </div>
              <span className="text-2xl font-semibold">{targetCount}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Found</span>
              </div>
              <span className="text-2xl font-semibold">{collectedCount}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <Loader2 className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`} />
                <span className="text-sm">Status</span>
              </div>
              <span className="text-lg font-medium">
                {isSearching ? 'Searching...' : results.length > 0 ? 'Complete' : 'Ready'}
              </span>
            </div>
          </div>
        )}

        {/* Strategies */}
        {pendingQueries.length > 0 && !isSearching && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Search Strategies</h3>
              <span className="text-sm text-white/50">{pendingQueries.length} queries</span>
            </div>
            <div className="space-y-2 mb-4">
              {pendingQueries.map((q, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/30 text-sm"
                >
                  <span className="text-white/40 font-mono w-6">{i + 1}</span>
                  <code className="flex-1 text-white/70 truncate">{q}</code>
                  <button 
                    onClick={() => setPendingQueries(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-white/30 hover:text-white/60 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setPendingQueries([])}
                className="border-white/20 bg-transparent hover:bg-white/5 text-white/70"
              >
                Cancel
              </Button>
              <Button 
                onClick={startDiscovery}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Search
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-medium">Results</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleNewSearch}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                New Search
              </Button>
            </div>
            <ResultsTable results={results} query={query} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !isSearching && results.length === 0 && pendingQueries.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
              <Search className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white/70 mb-2">Ready to search</h3>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              Enter your search criteria above and let our AI find the perfect leads for your business
            </p>
          </div>
        )}
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

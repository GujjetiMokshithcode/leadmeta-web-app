'use client';

import { useState } from 'react';
import SearchForm from '@/components/search-form';
import ResultsTable from '@/components/results-table';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, X, RefreshCw } from 'lucide-react';

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

export default function Home() {
  const [results, setResults] = useState<EmailResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [pendingQueries, setPendingQueries] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(50);
  const [usedQueries, setUsedQueries] = useState<Set<string>>(new Set());

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSearch = async (input: string, count: number, mode: 'ai' | 'manual') => {
    if (!input.trim()) {
      setError(mode === 'ai' ? 'Please tell the AI what leads you need' : 'Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(input);
    setTargetCount(count);
    setResults([]);
    setLogs([]);
    setCollectedCount(0);
    setPendingQueries([]);
    setUsedQueries(new Set());
    
    addLog(`Mode: ${mode.toUpperCase()} Discovery`);

    try {
      if (mode === 'ai') {
        addLog('Brainstorming search strategies with Groq AI...');
        const genResponse = await fetch('/api/generate-queries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input }),
        });

        const genData = await genResponse.json();
        if (!genResponse.ok) throw new Error(genData.error || 'AI generation failed');

        addLog(`AI generated ${genData.queries.length} strategies. Awaiting approval...`);
        setPendingQueries(genData.queries);
      } else {
        addLog(`Manual query registered: "${input}"`);
        startDiscovery([input], count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addLog(`Error: ${err instanceof Error ? err.message : 'Process failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const pivotSearch = async (currentTotal: number, target: number) => {
    addLog(`\n--- 🔄 AUTO-PIVOT: Target not reached (${currentTotal}/${target}) ---`);
    addLog(`AI is expanding search scope to find more leads...`);
    
    try {
      const pivotPrompt = `The previous search for "${query}" only found ${currentTotal} leads. We need ${target - currentTotal} more. 
      Generate 5 NEW, BROADER, and DIFFERENT Google search dorks. 
      Try different email providers like @outlook.com, @hotmail.com, @icloud.com. 
      Try broader job titles or locations if needed. 
      AVOID these already used queries: ${Array.from(usedQueries).join(', ')}`;

      const genResponse = await fetch('/api/generate-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pivotPrompt }),
      });

      const genData = await genResponse.json();
      if (genResponse.ok && genData.queries.length > 0) {
        addLog(`AI pivoted with ${genData.queries.length} new strategies.`);
        return genData.queries;
      }
    } catch (e) {
      addLog(`Pivot failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    return [];
  };

  const startDiscovery = async (overrideQueries?: string[], overrideTarget?: number) => {
    let queriesToRun = overrideQueries || pendingQueries;
    const finalTarget = overrideTarget || targetCount;
    if (queriesToRun.length === 0) return;
    
    setIsSearching(true);
    setError(null);
    
    const emailsSet = new Set<string>(results.map(r => r.email));
    const allEmails: EmailResult[] = [...results];
    const MAX_PAGES_PER_QUERY = 50; 
    const PAGE_SIZE = 20;

    addLog(`\n🚀 Discovery active. Searching for ${finalTarget} leads...`);

    try {
      let activeQueries = [...queriesToRun];
      
      while (activeQueries.length > 0 && emailsSet.size < finalTarget) {
        const currentQuery = activeQueries.shift()!;
        
        if (usedQueries.has(currentQuery)) continue;
        setUsedQueries(prev => new Set(prev).add(currentQuery));

        addLog(`\n--- Running Strategy: "${currentQuery}" ---`);
        let page = 1;
        let consecutiveZeroPages = 0;

        while (page <= MAX_PAGES_PER_QUERY && emailsSet.size < finalTarget) {
          try {
            addLog(`Fetching page ${page}...`);
            const response = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: currentQuery, page, num: PAGE_SIZE }),
            });

            const data: SearchResponse = await response.json();
            if (!response.ok) {
              addLog(`API Error: ${data.error || 'Unknown error'}`);
              break;
            }

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
                addLog(`+ Found ${newEmailsThisPage} new leads (Total: ${emailsSet.size})`);
                setCollectedCount(emailsSet.size);
                setResults([...allEmails]); // Live update results
                consecutiveZeroPages = 0;
              } else {
                addLog('Duplicate leads found on this page.');
                consecutiveZeroPages++;
              }
            } else {
              addLog('No leads found in metadata.');
              consecutiveZeroPages++;
            }

            if (data.organicCount === 0) {
              addLog(`\nStopped: End of results for this query.`);
              break;
            }

            if (emailsSet.size >= finalTarget) break;
            if (consecutiveZeroPages >= 5) {
              addLog(`\nStopped: Strategy exhausted (5 duplicate pages).`);
              break;
            }

            page++;
            await new Promise((res) => setTimeout(res, 400));
          } catch (e) {
            break;
          }
        }

        // AUTO-PIVOT LOGIC: If we ran out of queries but didn't hit target
        if (activeQueries.length === 0 && emailsSet.size < finalTarget) {
          const newQueries = await pivotSearch(emailsSet.size, finalTarget);
          if (newQueries.length > 0) {
            activeQueries = newQueries;
          } else {
            break; // Really stuck
          }
        }
      }

      if (emailsSet.size > 0) {
        addLog(`\n✅ Discovery Complete! Total leads collected: ${emailsSet.size}.`);
        setPendingQueries([]); 
      } else {
        setError('Discovery complete. No leads found. Try a different goal.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during discovery');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <SearchForm 
          onSearch={handleSearch} 
          loading={loading || isSearching} 
          logs={logs} 
          collectedCount={collectedCount} 
        />

        {error && (
          <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Strategy Approval Section */}
        {pendingQueries.length > 0 && !isSearching && (
          <div className="mt-12 animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">Review AI Strategies</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground/60">
                      The agent planned these strategies to reach your target
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-tighter font-black px-3">
                    Agent Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {pendingQueries.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background group hover:border-primary/40 transition-all">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                        {i + 1}
                      </div>
                      <code className="flex-1 text-xs font-medium text-foreground truncate">{q}</code>
                      <button 
                        onClick={() => setPendingQueries(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive p-1 transition-colors shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-full font-bold text-muted-foreground h-12"
                    onClick={() => setPendingQueries([])}
                  >
                    Discard
                  </Button>
                  <Button 
                    className="flex-2 rounded-full font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 h-12 px-8"
                    onClick={() => startDiscovery()}
                  >
                    <Play className="h-4 w-4 mr-2 fill-current" />
                    Launch Discovery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-12">
            <ResultsTable results={results} query={query} />
          </div>
        )}

        {!loading && !isSearching && results.length === 0 && pendingQueries.length === 0 && !error && (
          <div className="mt-20 text-center opacity-20">
            <div className="text-4xl mb-4 text-foreground">🤖</div>
            <p className="text-sm font-medium uppercase tracking-widest text-foreground">Awaiting Parameters</p>
          </div>
        )}
      </div>
    </main>
  );
}

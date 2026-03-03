'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroWave } from '@/components/ui/ai-input-hero';
import ResultsTable from '@/components/results-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Activity, 
  Terminal, 
  ArrowRight, 
  Layers, 
  Target, 
  Mail,
  Zap,
  Search,
  Brain,
  Sparkles,
  AlertCircle
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
  const [currentPage, setCurrentPage] = useState(0);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, `${timestamp} [SYSTEM] ${message}`]);
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
    
    addLog(`INITIALIZING DISCOVERY PROTOCOL: ${mode.toUpperCase()}`);

    try {
      if (mode === 'ai') {
        addLog('Brainstorming search strategies with Groq AI core...');
        const genResponse = await fetch('/api/generate-queries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input }),
        });

        const genData = await genResponse.json();
        if (!genResponse.ok) throw new Error(genData.error || 'AI generation failed');

        addLog(`Intelligence core generated ${genData.queries.length} mission-critical strategies.`);
        setPendingQueries(genData.queries);
        
        setTimeout(() => {
          const reviewSection = document.getElementById('review-section');
          reviewSection?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        addLog(`Manual target signature registered: "${input}"`);
        startDiscovery([input], count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addLog(`CRITICAL ERROR: ${err instanceof Error ? err.message : 'Process failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const pivotSearch = async (currentTotal: number, target: number) => {
    addLog(`RE-ROUTING: Target shortfall detected (${currentTotal}/${target})`);
    addLog(`AI is expanding cognitive scope to acquire more leads...`);
    
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
        addLog(`Intelligence core pivoted with ${genData.queries.length} expanded strategies.`);
        return genData.queries;
      }
    } catch (e) {
      addLog(`PIVOT FAILURE: ${e instanceof Error ? e.message : 'Unknown error'}`);
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

    addLog(`DISCOVERY ENGINE ONLINE. TARGET: ${finalTarget} LEADS.`);

    try {
      let activeQueries = [...queriesToRun];
      
      while (activeQueries.length > 0 && emailsSet.size < finalTarget) {
        const currentQuery = activeQueries.shift()!;
        
        if (usedQueries.has(currentQuery)) continue;
        setUsedQueries(prev => new Set(prev).add(currentQuery));

        addLog(`EXECUTING MISSION PLAN: "${currentQuery}"`);
        let page = 1;
        let consecutiveZeroPages = 0;

        while (page <= MAX_PAGES_PER_QUERY && emailsSet.size < finalTarget) {
          try {
            setCurrentPage(page);
            addLog(`Scanning Digital Perimeter - Page ${page}...`);
            const response = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: currentQuery, page, num: PAGE_SIZE }),
            });

            const data: SearchResponse = await response.json();
            if (!response.ok) {
              addLog(`SCAN ERROR: ${data.error || 'Unknown error'}`);
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
                addLog(`ACQUIRED ${newEmailsThisPage} NEW TARGET SIGNATURES (Total: ${emailsSet.size})`);
                setCollectedCount(emailsSet.size);
                setResults([...allEmails]);
                consecutiveZeroPages = 0;
              } else {
                addLog('Redundant signatures detected. Skipping.');
                consecutiveZeroPages++;
              }
            } else {
              addLog('Zero yield on current perimeter.');
              consecutiveZeroPages++;
            }

            if (data.organicCount === 0) {
              addLog(`END OF SIGNAL for current strategy.`);
              break;
            }

            if (emailsSet.size >= finalTarget) break;
            if (consecutiveZeroPages >= 5) {
              addLog(`STRATEGY DEPLETED (Signal Saturation).`);
              break;
            }

            page++;
            await new Promise((res) => setTimeout(res, 400));
          } catch (e) {
            break;
          }
        }

        if (activeQueries.length === 0 && emailsSet.size < finalTarget) {
          const newQueries = await pivotSearch(emailsSet.size, finalTarget);
          if (newQueries.length > 0) {
            activeQueries = newQueries;
          } else {
            break; 
          }
        }
      }

      if (emailsSet.size > 0) {
        addLog(`MISSION SUCCESS. ACQUIRED ${emailsSet.size} TOTAL SIGNATURES.`);
        setPendingQueries([]); 
      } else {
        setError('Discovery phase concluded with zero yield. Refine parameters.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during discovery');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <HeroWave 
        title="Leadmeta Engine"
        subtitle="AI-powered lead discovery for modern sales teams"
        placeholder="e.g., 'CTOs at Series A fintech startups in Berlin'"
        onPromptSubmit={handleSearch}
      />

      {/* Dashboard Section */}
      <section className="relative z-10 -mt-20 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3 animate-in slide-in-from-top-4">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Stats Dashboard */}
          {(isSearching || results.length > 0 || loading) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard 
                icon={<Target className="h-4 w-4" />}
                label="Target"
                value={targetCount}
                color="blue"
              />
              <StatCard 
                icon={<Mail className="h-4 w-4" />}
                label="Collected"
                value={collectedCount}
                color="green"
                highlight={collectedCount > 0}
              />
              <StatCard 
                icon={<Layers className="h-4 w-4" />}
                label="Strategies"
                value={usedQueries.size + (isSearching ? 1 : 0)}
                color="purple"
              />
              <StatCard 
                icon={<Activity className={`h-4 w-4 ${isSearching ? 'animate-pulse' : ''}`} />}
                label="Status"
                value={isSearching ? 'Active' : results.length > 0 ? 'Complete' : 'Ready'}
                color={isSearching ? 'amber' : results.length > 0 ? 'green' : 'slate'}
                subtext={isSearching ? `Page ${currentPage}` : undefined}
              />
            </div>
          )}

          {/* Loading State - AI Generating */}
          {loading && pendingQueries.length === 0 && (
            <Card className="glass-card p-8 mb-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#1f3dbc]/20 blur-xl rounded-full animate-pulse"></div>
                  <Brain className="h-12 w-12 text-[#1f3dbc] relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Analyzing your request...</h3>
                  <p className="text-sm text-muted-foreground">Our AI is crafting optimal search strategies</p>
                </div>
                <div className="w-64 space-y-2">
                  <Skeleton className="h-2 w-full bg-white/5" />
                  <Skeleton className="h-2 w-3/4 bg-white/5" />
                  <Skeleton className="h-2 w-1/2 bg-white/5" />
                </div>
              </div>
            </Card>
          )}

          {/* Strategy Review Section */}
          {pendingQueries.length > 0 && !isSearching && (
            <Card className="glass-card gradient-border mb-8 animate-in fade-in zoom-in-95 duration-500">
              <CardHeader className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#1f3dbc]/10 border border-[#1f3dbc]/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#1f3dbc]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">AI Search Strategies</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Review and customize the search queries
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-[#1f3dbc]/10 text-[#1f3dbc] border-[#1f3dbc]/20">
                    {pendingQueries.length} Queries
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  {pendingQueries.map((q, i) => (
                    <div 
                      key={i} 
                      className="group flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#1f3dbc]/30 transition-all"
                    >
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </div>
                      <code className="flex-1 text-sm text-foreground/80 truncate">{q}</code>
                      <button 
                        onClick={() => setPendingQueries(prev => prev.filter((_, idx) => idx !== i))}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <input
                      type="number"
                      value={targetCount}
                      onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                      className="w-16 bg-transparent text-lg font-semibold text-[#1f3dbc] focus:outline-none"
                    />
                    <span className="text-sm text-muted-foreground">leads</span>
                  </div>
                  <div className="flex-1"></div>
                  <Button 
                    variant="outline" 
                    className="glass hover:bg-white/5"
                    onClick={() => setPendingQueries([])}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#1f3dbc] hover:bg-[#1f3dbc]/90 text-white gap-2"
                    onClick={() => startDiscovery()}
                  >
                    Start Discovery
                    <Play className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ResultsTable results={results} query={query} />
            </div>
          )}

          {/* Activity Log */}
          {logs.length > 0 && (
            <Card className="glass-card mt-8 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Activity Log</span>
                <div className="flex-1"></div>
                <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isSearching ? 'animate-spin' : ''}`} />
              </div>
              <div 
                ref={logContainerRef}
                className="h-48 overflow-y-auto p-4 font-mono text-xs custom-scrollbar"
              >
                {logs.map((log, idx) => {
                  const isAcquisition = log.includes('ACQUIRED');
                  const isError = log.includes('ERROR') || log.includes('FAILURE');
                  const isStart = log.includes('INITIALIZING') || log.includes('EXECUTING');
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 py-1 ${isAcquisition ? 'text-green-400' : ''} ${isError ? 'text-red-400' : ''} ${isStart ? 'text-[#1f3dbc]' : 'text-muted-foreground'}`}
                    >
                      <span className="text-white/20 shrink-0">{idx.toString().padStart(3, '0')}</span>
                      <span className="break-all">{log}</span>
                    </div>
                  );
                })}
                {isSearching && (
                  <div className="flex gap-3 py-1 text-[#1f3dbc] animate-pulse">
                    <span className="text-white/20 shrink-0">...</span>
                    <span>Scanning...</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !isSearching && results.length === 0 && pendingQueries.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to discover leads</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Enter your search criteria above and let our AI find the perfect leads for your business
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color = 'blue',
  highlight = false,
  subtext
}: { 
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'slate';
  highlight?: boolean;
  subtext?: string;
}) {
  const colorClasses = {
    blue: 'from-[#1f3dbc]/20 to-[#1f3dbc]/5 text-[#1f3dbc]',
    green: 'from-green-500/20 to-green-500/5 text-green-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400',
    slate: 'from-slate-500/20 to-slate-500/5 text-slate-400',
  };

  return (
    <div className={`glass-card p-4 group hover:border-white/10 transition-all ${highlight ? 'glow-subtle' : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} border border-white/10 flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
      </div>
    </div>
  );
}
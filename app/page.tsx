'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroWave } from '@/components/ui/ai-input-hero';
import ResultsTable from '@/components/results-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, X, RefreshCw, CheckCircle2, Activity, Terminal, ArrowRight, Layers, Target, Mail } from 'lucide-react';

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
    <main className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-primary/30">
      <HeroWave 
        title="Leadmeta Engine"
        subtitle="Autonomous intelligence for high-precision lead discovery."
        placeholder="e.g., 'Target CTOs at Series A fintech startups in Berlin'"
        onPromptSubmit={handleSearch}
      />

      <div className="container mx-auto px-4 max-w-5xl -mt-32 relative z-20">
        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm text-center backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <span className="font-black mr-2">[!] SYSTEM ALERT:</span> {error}
          </div>
        )}

        {/* Discovery HUD */}
        {(isSearching || results.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md group hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60">Target</span>
              </div>
              <div className="text-2xl font-black">{targetCount}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md group hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60">Collected</span>
              </div>
              <div className="text-2xl font-black text-primary">{collectedCount}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md group hover:border-primary/40 transition-colors text-center sm:text-left">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60">Strategies</span>
              </div>
              <div className="text-2xl font-black">{usedQueries.size + (isSearching ? 1 : 0)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md group hover:border-primary/40 transition-colors text-right sm:text-left">
              <div className="flex items-center gap-3 mb-2">
                <Activity className={`h-4 w-4 ${isSearching ? 'text-primary animate-pulse' : 'text-white/40'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60">Status</span>
              </div>
              <div className="text-sm font-black uppercase tracking-tighter">
                {isSearching ? `Scanning Page ${currentPage}...` : results.length > 0 ? 'Protocol Idle' : 'Ready'}
              </div>
            </div>
          </div>
        )}

        {/* Strategy Approval Section */}
        {pendingQueries.length > 0 && !isSearching && (
          <div id="review-section" className="mt-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <Card className="relative border-white/10 bg-black/60 backdrop-blur-2xl rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        <CardTitle className="text-2xl font-bold tracking-tight">Mission Briefing</CardTitle>
                      </div>
                      <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30">
                        AI Strategist has drafted the following deployment plan
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest font-black px-4 py-1.5 rounded-full text-[10px]">
                      Awaiting Deployment
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="grid gap-3">
                    {pendingQueries.map((q, i) => (
                      <div key={i} className="group relative flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300">
                        <div className="h-8 w-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-[10px] font-black text-primary group-hover:text-white group-hover:bg-primary transition-all shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate block">{q}</code>
                        </div>
                        <button 
                          onClick={() => setPendingQueries(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-white/20 hover:text-red-500 p-2 transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                    <div className="flex-1 flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Acquisition Target</span>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={targetCount}
                          onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                          className="w-16 bg-transparent text-xl font-black text-primary focus:outline-none"
                        />
                        <span className="text-xs font-bold text-white/60">Leads</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 h-14 px-8 border border-transparent hover:border-white/10 transition-all"
                      onClick={() => setPendingQueries([])}
                    >
                      ABORT MISSION
                    </Button>
                    <Button 
                      className="rounded-2xl font-black uppercase tracking-[0.2em] bg-primary text-white shadow-[0_0_30px_-5px_rgba(31,61,188,0.5)] h-14 px-10 hover:bg-primary/80 transition-all group"
                      onClick={() => startDiscovery()}
                    >
                      LAUNCH PROTOCOL
                      <Play className="h-4 w-4 ml-3 fill-current group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Acquired Data
                </h2>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em]">Verified leads found in the digital perimeter</p>
              </div>
              <Badge variant="outline" className="border-white/10 text-white/40 px-3 py-1 font-mono text-[10px]">
                {results.length} ENTRIES
              </Badge>
            </div>
            <ResultsTable results={results} query={query} />
          </div>
        )}

        {/* Terminal Logs Section */}
        {logs.length > 0 && (
          <div className="mt-16 group">
            <div className="flex items-center gap-4 mb-4 px-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <div className="flex items-center gap-2 text-white/20">
                <RefreshCw className={`h-3 w-3 ${isSearching ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Engine Console</span>
              </div>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-0.5 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div 
                ref={logContainerRef}
                className="relative h-64 overflow-y-auto rounded-2xl border border-white/5 bg-black/80 backdrop-blur-xl p-6 font-mono text-[11px] leading-relaxed text-white/40 shadow-2xl custom-scrollbar"
              >
                {logs.map((log, idx) => {
                  const isAcquisition = log.includes('ACQUIRED');
                  const isError = log.includes('ERROR') || log.includes('FAILURE') || log.includes('[!]');
                  const isMissionStart = log.includes('INITIALIZING') || log.includes('EXECUTING');
                  
                  return (
                    <div key={idx} className={`mb-1.5 flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300 ${isAcquisition ? 'text-primary/80 font-bold' : ''} ${isError ? 'text-red-500/80' : ''} ${isMissionStart ? 'text-white font-bold' : ''}`}>
                      <span className="shrink-0 opacity-20 text-[9px] mt-0.5">{idx.toString().padStart(4, '0')}</span>
                      <span className="shrink-0 text-primary opacity-40">»</span>
                      <span className="break-all">{log}</span>
                    </div>
                  );
                })}
                {isSearching && (
                  <div className="flex gap-4 mt-2 text-primary animate-pulse">
                    <span className="shrink-0 opacity-20 text-[9px]">....</span>
                    <span className="shrink-0 opacity-40">»</span>
                    <span>ADAPTIVE SCANNING IN PROGRESS...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}

'use client';

import { useState } from 'react';
import SearchForm from '@/components/search-form';
import ResultsTable from '@/components/results-table';
import Header from '@/components/header';

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
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const optimizeQuery = (q: string): string => {
    let optimized = q.trim();
    
    // Convert 'or' to 'OR' (Google requirement for operators)
    optimized = optimized.replace(/\s+or\s+/gi, ' OR ');
    
    // Simplify overly specific locations that might limit results
    optimized = optimized.replace(/"new york, new york, united states"/gi, '"New York"');
    optimized = optimized.replace(/"united states"/gi, 'USA');
    
    return optimized;
  };

  const handleSearch = async (searchQuery: string, targetCount: number) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(searchQuery);
    setResults([]);
    setLogs([]);
    setCollectedCount(0);
    
    const optimizedInitialQuery = optimizeQuery(searchQuery);
    addLog(`Starting search for: "${optimizedInitialQuery}"`);
    if (optimizedInitialQuery !== searchQuery) {
      addLog(`(Query optimized for better results)`);
    }
    addLog(`Target email count: ${targetCount}`);

    const emailsSet = new Set<string>();
    const allEmails: EmailResult[] = [];
    let page = 1;
    let consecutiveZeroPages = 0;
    const MAX_PAGES = 200; 
    const PAGE_SIZE = 20;

    // We can try fallback queries if the main one fails early
    const queryVariants = [
      optimizedInitialQuery,
      // Fallback 1: Remove quotes around job titles if they were there
      optimizedInitialQuery.replace(/"/g, ''),
      // Fallback 2: Simplify site search
      optimizedInitialQuery.replace(/site:linkedin\.com\/in\//gi, 'site:linkedin.com')
    ];
    
    let variantIndex = 0;

    try {
      while (variantIndex < queryVariants.length && emailsSet.size < targetCount) {
        const currentQuery = queryVariants[variantIndex];
        if (variantIndex > 0) {
          addLog(`\n--- Trying fallback query to reach target: "${currentQuery}" ---`);
          page = 1; // Reset page for new query variant
          consecutiveZeroPages = 0;
        }

        while (page <= MAX_PAGES && emailsSet.size < targetCount) {
          try {
            addLog(`\nFetching page ${page}...`);

            const response = await fetch('/api/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query: currentQuery, page, num: PAGE_SIZE }),
            });

            const data: SearchResponse = await response.json();

            if (!response.ok || !data.success) {
              addLog(`API error: ${data.error || 'Unknown error'}`);
              break;
            }

            const emailsFoundOnPage = new Set<string>();
            let fromTitle = 0;
            let fromSnippet = 0;
            let fromUrl = 0;

            // Process emails from results
            if (data.emails && data.emails.length > 0) {
              addLog(`Found ${data.emails.length} emails on page ${page}`);

              data.emails.forEach((result: EmailResult) => {
                const normalizedEmail = result.email.toLowerCase();
                if (!emailsSet.has(normalizedEmail)) {
                  emailsSet.add(normalizedEmail);
                  emailsFoundOnPage.add(normalizedEmail);

                  // Track extraction source
                  if (result.extractedFrom === 'title') fromTitle++;
                  else if (result.extractedFrom === 'snippet') fromSnippet++;
                  else if (result.extractedFrom === 'url') fromUrl++;

                  allEmails.push({
                    email: normalizedEmail,
                    source: result.source,
                    extractedFrom: result.extractedFrom,
                  });
                }
              });

              if (emailsFoundOnPage.size > 0) {
                addLog(`  ├─ From Title: ${fromTitle}`);
                addLog(`  ├─ From Snippet: ${fromSnippet}`);
                addLog(`  ├─ From URL: ${fromUrl}`);
                addLog(`  └─ Total new: ${emailsFoundOnPage.size} (total collected: ${emailsSet.size})`);
                setCollectedCount(emailsSet.size);
                consecutiveZeroPages = 0; 
              } else {
                addLog(`  └─ No new emails found on page ${page} (duplicates)`);
                consecutiveZeroPages++;
              }
            } else {
              addLog(`  └─ No emails found in metadata of page ${page}`);
              consecutiveZeroPages++;
            }

            // Check if Google returned any results at all
            if (data.organicCount === 0) {
              addLog(`\nStopped: No more results for this query variant.`);
              break;
            }

            // Check if target reached
            if (emailsSet.size >= targetCount) break;

            // Check if 10 consecutive pages returned zero new emails
            if (consecutiveZeroPages >= 10) {
              addLog(`\nStopped: Too many duplicate pages for this variant.`);
              break;
            }

            page += 1;
            await new Promise((res) => setTimeout(res, 500));
          } catch (pageErr) {
            addLog(`Error on page ${page}: ${pageErr instanceof Error ? pageErr.message : 'Unknown error'}`);
            break;
          }
        }
        
        if (emailsSet.size >= targetCount) break;
        variantIndex++;
      }

      // Log safety cap completion
      if (page > MAX_PAGES) {
        addLog(`\nStopped: Safety cap reached (${MAX_PAGES} pages)`);
      }

      if (allEmails.length === 0) {
        setError('No emails found for this query');
        addLog('Result: No emails found');
      } else {
        addLog(`\nCompleted! Total emails collected: ${allEmails.length}`);
        setResults(allEmails);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError('An error occurred while searching. Please try again.');
      addLog(`Fatal error: ${errorMsg}`);
      setResults([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <SearchForm onSearch={handleSearch} loading={loading} logs={logs} collectedCount={collectedCount} />

        {error && (
          <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-destructive">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Found {results.length} email{results.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <ResultsTable results={results} query={query} />
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              Enter a search query to discover business emails
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

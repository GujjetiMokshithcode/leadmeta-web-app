'use client';

import { useState } from 'react';
import SearchForm from '@/components/search-form';
import ResultsTable from '@/components/results-table';
import Header from '@/components/header';

interface EmailResult {
  email: string;
  source: string;
}

interface SearchResponse {
  success: boolean;
  emails: EmailResult[];
  totalFound: number;
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
    addLog(`Starting search for: "${searchQuery}"`);
    addLog(`Target email count: ${targetCount}`);

    const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    const emailsSet = new Set<string>();
    const allEmails: EmailResult[] = [];
    let start = 0;
    let page = 1;
    const maxPages = 10;

    try {
      while (emailsSet.size < targetCount && page <= maxPages) {
        try {
          addLog(`\nFetching page ${page} (offset: ${start})...`);

          const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchQuery, start, num: 10 }),
          });

          const data: SearchResponse = await response.json();

          if (!response.ok || !data.success) {
            addLog(`API error: ${data.error || 'Unknown error'}`);
            break;
          }

          const emailsFoundOnPage = new Set<string>();

          // Extract emails from results
          if (data.emails && data.emails.length > 0) {
            addLog(`Found ${data.emails.length} results on page ${page}`);

            data.emails.forEach((result: EmailResult) => {
              const matches = (result.source + ' ' + result.email).match(EMAIL_REGEX);
              if (matches) {
                matches.forEach((email) => {
                  const normalizedEmail = email.toLowerCase();
                  if (!emailsSet.has(normalizedEmail)) {
                    emailsSet.add(normalizedEmail);
                    emailsFoundOnPage.add(normalizedEmail);
                    allEmails.push({
                      email: normalizedEmail,
                      source: result.source,
                    });
                  }
                });
              }
            });

            if (emailsFoundOnPage.size > 0) {
              addLog(`Extracted ${emailsFoundOnPage.size} new emails from page ${page}`);
              setCollectedCount(emailsSet.size);
            } else {
              addLog(`No new emails found on page ${page}`);
            }
          } else {
            addLog(`No results returned on page ${page}`);
            break;
          }

          // Check if target reached
          if (emailsSet.size >= targetCount) {
            addLog(`\nTarget reached! (${emailsSet.size} >= ${targetCount})`);
            break;
          }

          start += 10;
          page += 1;

          // Add delay between requests (500ms)
          if (page <= maxPages) {
            await new Promise((res) => setTimeout(res, 500));
          }
        } catch (pageErr) {
          addLog(`Error on page ${page}: ${pageErr instanceof Error ? pageErr.message : 'Unknown error'}`);
          break;
        }
      }

      // Log completion reason
      if (page > maxPages) {
        addLog(`\nStopped: Maximum pages (${maxPages}) reached`);
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

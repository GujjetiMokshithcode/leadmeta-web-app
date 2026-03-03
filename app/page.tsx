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

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to fetch results');
        setResults([]);
      } else {
        setResults(data.emails);
        if (data.totalFound === 0) {
          setError('No emails found for this query');
        }
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
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
        <SearchForm onSearch={handleSearch} loading={loading} />

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

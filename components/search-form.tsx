'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchFormProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e as unknown as React.FormEvent);
    }
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
              'Search'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
          <div>💼 Find decision makers</div>
          <div>📧 Extract emails instantly</div>
          <div>📊 Build prospect lists</div>
        </div>
      </div>
    </form>
  );
}

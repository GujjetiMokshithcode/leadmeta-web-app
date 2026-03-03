'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { downloadCSV, copyToClipboard, formatSource } from '@/lib/email-utils';

interface EmailResult {
  email: string;
  source: string;
}

interface ResultsTableProps {
  results: EmailResult[];
  query: string;
}

export default function ResultsTable({ results, query }: ResultsTableProps) {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  const handleCopy = async () => {
    const emails = results.map((r) => r.email);
    const success = await copyToClipboard(emails);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    downloadCSV(results, `leadmeta-${query.replace(/\s+/g, '-')}-${Date.now()}.csv`);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-border bg-card text-foreground hover:bg-secondary"
        >
          {copied ? '✓ Copied' : '📋 Copy All Emails'}
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-border bg-card text-foreground hover:bg-secondary"
        >
          {exported ? '✓ Exported' : '📥 Export CSV'}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Source</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={index}
                className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground break-all">
                  {result.email}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatSource(result.source)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.email);
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Copy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border/50 bg-secondary/10 p-4 text-sm text-muted-foreground">
        <p>
          <strong>{results.length}</strong> email{results.length !== 1 ? 's' : ''} found for "
          <strong>{query}</strong>"
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { downloadCSV, copyToClipboard } from '@/lib/email-utils';
import { 
  Copy, 
  Check, 
  Download,
  ExternalLink,
} from 'lucide-react';

interface EmailResult {
  email: string;
  source: string;
  extractedFrom?: 'title' | 'snippet' | 'url';
}

interface ResultsTableProps {
  results: EmailResult[];
  query: string;
}

export default function ResultsTable({ results, query }: ResultsTableProps) {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = async () => {
    const emails = results.map((r) => r.email);
    const success = await copyToClipboard(emails);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    downloadCSV(results, `leads-${Date.now()}.csv`);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleCopyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getSourceBadge = (extractedFrom?: string) => {
    switch (extractedFrom) {
      case 'title':
        return <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">Title</Badge>;
      case 'snippet':
        return <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">Snippet</Badge>;
      case 'url':
        return <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">URL</Badge>;
      default:
        return null;
    }
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-zinc-700 text-zinc-300',
      'bg-neutral-700 text-neutral-300',
      'bg-stone-700 text-stone-300',
      'bg-gray-700 text-gray-300',
      'bg-slate-700 text-slate-300',
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const cleanSource = (source: string) => {
    return source.replace(/^https?:\/\//, '').split('/')[0];
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">{results.length} Leads</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90 rounded-lg transition-colors font-medium"
          >
            {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {exported ? 'Done' : 'Export'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-[#0f0f0f]">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider w-1/2">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">From</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium ${getAvatarColor(result.email)}`}>
                        {result.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white/80 font-mono">{result.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a 
                      href={result.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{cleanSource(result.source)}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {getSourceBadge(result.extractedFrom)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleCopyEmail(result.email)}
                      className="p-2 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {copiedEmail === result.email ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </div>
  );
}

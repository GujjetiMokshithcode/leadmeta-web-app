'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { downloadCSV, copyToClipboard } from '@/lib/email-utils';
import { 
  Copy, 
  Check, 
  Download,
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

      {/* Data Grid Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0f0f0f]">
        <div className="overflow-auto h-[calc(100vh-180px)]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[45%]" />
              <col className="w-[30%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-white/10">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Email Address</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Source</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Extracted</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-white/30 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {results.map((result, index) => (
                <tr
                  key={index}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-2">
                    <span className="text-sm text-white/80 font-mono truncate block">{result.email}</span>
                  </td>
                  <td className="px-4 py-2">
                    <a 
                      href={result.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-white/40 hover:text-white/60 transition-colors truncate block"
                    >
                      {cleanSource(result.source)}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    {getSourceBadge(result.extractedFrom)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleCopyEmail(result.email)}
                      className="p-1.5 text-white/20 hover:text-white/50 hover:bg-white/5 rounded transition-colors"
                    >
                      {copiedEmail === result.email ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

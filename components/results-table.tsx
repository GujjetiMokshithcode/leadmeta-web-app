'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { downloadCSV, copyToClipboard, formatSource } from '@/lib/email-utils';
import { 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  Mail, 
  ExternalLink,
  Sparkles
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
    downloadCSV(results, `leadmeta-${query.replace(/\s+/g, '-')}-${Date.now()}.csv`);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleCopyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getSourceIcon = (source: string) => {
    if (source === 'knowledge-graph') return <Sparkles className="h-3 w-3" />;
    if (source === 'answer-box') return <Sparkles className="h-3 w-3" />;
    return <ExternalLink className="h-3 w-3" />;
  };

  const getSourceBadge = (extractedFrom?: string) => {
    switch (extractedFrom) {
      case 'title':
        return <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Title</Badge>;
      case 'snippet':
        return <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Snippet</Badge>;
      case 'url':
        return <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">URL</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1f3dbc]/20 to-[#1f3dbc]/5 border border-[#1f3dbc]/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-[#1f3dbc]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{results.length.toLocaleString()} Leads Found</h3>
            <p className="text-sm text-muted-foreground">For "{query}"</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="glass hover:bg-white/5 border-white/10"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied' : 'Copy All'}
          </Button>
          <Button
            onClick={handleExport}
            className="bg-[#1f3dbc] hover:bg-[#1f3dbc]/90 text-white"
          >
            {exported ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {exported ? 'Exported' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        <ScrollArea className="h-[400px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Extracted</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((result, index) => (
                <tr
                  key={index}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xs font-medium text-white/60">
                        {result.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white break-all">{result.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getSourceIcon(result.source)}
                      <span className="truncate max-w-[150px]">{formatSource(result.source)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getSourceBadge(result.extractedFrom)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyEmail(result.email)}
                      className="h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-white"
                    >
                      {copiedEmail === result.email ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Ready to export
          </span>
          <span className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV format
          </span>
        </div>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

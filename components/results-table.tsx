'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { downloadCSV, copyToClipboard } from '@/lib/email-utils';
import { useEmailVerifier, VerificationResult } from '@/hooks/useEmailVerifier';
import { 
  Copy, 
  Check, 
  Download,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Filter,
  RotateCcw,
  ChevronDown,
  FileDown,
  MailCheck,
  ListCheck
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
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const { verifyEmails, results: verifiedResults, loading: verifying, progress, clearResults } = useEmailVerifier();

  const handleCopy = async () => {
    const emailsToCopy = showVerifiedOnly 
      ? verifiedResults.filter(r => r.valid).map(r => r.email)
      : results.map((r) => r.email);
    const success = await copyToClipboard(emailsToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (showVerifiedOnly) {
      const validEmails = verifiedResults.filter(r => r.valid);
      const exportData: EmailResult[] = validEmails.map(r => ({ 
        email: r.email, 
        source: 'verified', 
        extractedFrom: undefined 
      }));
      downloadCSV(exportData, `leads-verified-${Date.now()}.csv`);
    } else {
      downloadCSV(results, `leads-${Date.now()}.csv`);
    }
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleVerify = async () => {
    const emails = results.map(r => r.email);
    await verifyEmails(emails);
  };

  const handleClearVerification = () => {
    clearResults();
    setShowVerifiedOnly(false);
  };

  const getVerificationForEmail = (email: string): VerificationResult | undefined => {
    return verifiedResults.find(v => v.email.toLowerCase() === email.toLowerCase());
  };

  const validCount = verifiedResults.filter(r => r.valid).length;
  const invalidCount = verifiedResults.length - validCount;
  const selectedCount = selectedEmails.size;

  const handleSelectEmail = (email: string, checked: boolean) => {
    const newSelected = new Set(selectedEmails);
    if (checked) {
      newSelected.add(email);
    } else {
      newSelected.delete(email);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(new Set(displayResults.map(r => r.email)));
    } else {
      setSelectedEmails(new Set());
    }
  };

  const handleDownloadSelected = () => {
    const selectedData = results.filter(r => selectedEmails.has(r.email));
    downloadCSV(selectedData, `leads-selected-${Date.now()}.csv`);
    setShowDownloadMenu(false);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleDownloadVerified = () => {
    const validEmails = verifiedResults.filter(r => r.valid);
    const exportData: EmailResult[] = validEmails.map(r => ({ 
      email: r.email, 
      source: 'verified', 
      extractedFrom: undefined 
    }));
    downloadCSV(exportData, `leads-verified-${Date.now()}.csv`);
    setShowDownloadMenu(false);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleDownloadAll = () => {
    downloadCSV(results, `leads-${Date.now()}.csv`);
    setShowDownloadMenu(false);
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

  const getVerificationBadge = (verification?: VerificationResult) => {
    if (!verification) return null;
    if (verification.valid) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]"><ShieldCheck className="h-3 w-3 mr-1" />Valid</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"><ShieldAlert className="h-3 w-3 mr-1" />{verification.reason}</Badge>;
  };

  const displayResults = showVerifiedOnly 
    ? results.filter(r => {
        const v = getVerificationForEmail(r.email);
        return v?.valid;
      })
    : results;

  const allSelected = displayResults.length > 0 && displayResults.every(r => selectedEmails.has(r.email));
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-white">
            {showVerifiedOnly ? `${validCount} Verified Leads` : `${results.length} Leads`}
          </h2>
          {verifiedResults.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">{validCount} valid</span>
              <span className="text-white/30">•</span>
              <span className="text-red-400">{invalidCount} invalid</span>
            </div>
          )}
          {selectedCount > 0 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <ListCheck className="h-3 w-3 mr-1" />
              {selectedCount} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {verifiedResults.length === 0 ? (
            <Button
              onClick={handleVerify}
              disabled={verifying || results.length === 0}
              className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              {verifying ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
              ) : (
                <><Shield className="h-4 w-4 mr-2" /> Verify Emails</>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                variant="outline"
                className={`h-9 px-4 border-white/20 ${showVerifiedOnly ? 'bg-white/10 text-white' : 'bg-transparent text-white/70'}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showVerifiedOnly ? 'Show All' : 'Show Valid Only'}
              </Button>
              <Button
                onClick={handleClearVerification}
                variant="outline"
                className="h-9 px-4 border-white/20 bg-transparent text-white/70 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          
          {/* Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90 rounded-lg transition-colors font-medium"
            >
              {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {exported ? 'Done' : 'Download'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleDownloadAll}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <FileDown className="h-4 w-4 text-white/50" />
                    <div>
                      <div className="font-medium">All Leads</div>
                      <div className="text-xs text-white/40">{results.length} emails</div>
                    </div>
                  </button>
                  
                  {verifiedResults.length > 0 && (
                    <button
                      onClick={handleDownloadVerified}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <MailCheck className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="font-medium">Verified Only</div>
                        <div className="text-xs text-white/40">{validCount} valid emails</div>
                      </div>
                    </button>
                  )}
                  
                  {selectedCount > 0 && (
                    <button
                      onClick={handleDownloadSelected}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <ListCheck className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="font-medium">Selected Only</div>
                        <div className="text-xs text-white/40">{selectedCount} emails</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {verifying && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/50">
            <span>Verifying emails...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-white/10" />
        </div>
      )}

      {/* Data Grid Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0f0f0f]">
        <div className="overflow-auto h-[calc(100vh-220px)]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[33%]" />
              <col className="w-[24%]" />
              <col className="w-[12%]" />
              <col className="w-[17%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-white/10">
              <tr>
                <th className="px-2 py-2.5 text-center">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Email Address</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Source</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Extracted</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-white/30 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {displayResults.map((result, index) => {
                const verification = getVerificationForEmail(result.email);
                const isSelected = selectedEmails.has(result.email);
                return (
                  <tr
                    key={index}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-blue-500/[0.05]' : ''
                    } ${
                      verification ? (verification.valid ? 'bg-green-500/[0.02]' : 'bg-red-500/[0.02]') : ''
                    }`}
                  >
                    <td className="px-2 py-2 text-center">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectEmail(result.email, checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                    </td>
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
                    <td className="px-4 py-2">
                      {getVerificationBadge(verification)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

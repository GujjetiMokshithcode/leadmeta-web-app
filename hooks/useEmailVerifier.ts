'use client';

import { useCallback, useState } from 'react';
import validator from 'validator';

export interface VerificationResult {
  email: string;
  valid: boolean;
  reason?: string;
  details?: {
    syntax: boolean;
    disposable: boolean;
    role: boolean;
    mx: boolean;
  };
}

// Production disposable/role lists
const DISPOSABLES = new Set([
  'mailinator.com', 'tempmail.org', 'guerrillamail.com', '10minutemail.com',
  'yopmail.com', 'sharklasers.com', 'getnada.com', 'maildrop.cc', 'tempmail.lol',
  'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 'mailnesia.com',
  'tempinbox.com', 'sharklasers.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.de', 'guerrillamail.biz', 'grr.la', 'guerrillamailblock.com',
  'spam4.me', 'trashmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf',
  'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
  'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf'
]);

const ROLE_ACCOUNTS = new Set([
  'admin', 'webmaster', 'noreply', 'no-reply', 'info', 'support', 'sales',
  'marketing', 'contact', 'help', 'service', 'team', 'office', 'billing',
  'accounts', 'hr', 'legal', 'security', 'abuse', 'postmaster', 'hostmaster',
  'usenet', 'ftp', 'www', 'root', 'sysadmin', 'administrator', 'postmaster'
]);

export function useEmailVerifier() {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const verifySingle = useCallback(async (email: string): Promise<VerificationResult> => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1️⃣ Syntax validation
    const syntaxOk = validator.isEmail(normalizedEmail);
    if (!syntaxOk) {
      return { 
        email: normalizedEmail, 
        valid: false, 
        reason: 'invalid_syntax',
        details: { syntax: false, disposable: false, role: false, mx: false }
      };
    }

    // 2️⃣ Disposable/role detection
    const [, domain] = normalizedEmail.split('@');
    const domainLow = domain?.toLowerCase() || '';
    const local = normalizedEmail.split('@')[0].toLowerCase();
    
    const isDisposable = DISPOSABLES.has(domainLow);
    const isRole = ROLE_ACCOUNTS.has(local);
    
    if (isDisposable) {
      return { 
        email: normalizedEmail, 
        valid: false, 
        reason: 'disposable',
        details: { syntax: true, disposable: true, role: false, mx: false }
      };
    }
    
    if (isRole) {
      return { 
        email: normalizedEmail, 
        valid: false, 
        reason: 'role_account',
        details: { syntax: true, disposable: false, role: true, mx: false }
      };
    }

    // 3️⃣ MX/DNS domain check using Google DNS
    let mxOk = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(`https://dns.google/resolve?name=${domainLow}&type=MX`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      mxOk = data.Status === 0 && data.Answer?.length > 0;
    } catch {
      mxOk = false;
    }

    if (!mxOk) {
      return { 
        email: normalizedEmail, 
        valid: false, 
        reason: 'no_mx_records',
        details: { syntax: true, disposable: false, role: false, mx: false }
      };
    }

    return {
      email: normalizedEmail,
      valid: true,
      reason: 'mx_ok',
      details: { syntax: true, disposable: false, role: false, mx: true }
    };
  }, []);

  const verifyEmails = useCallback(async (emails: string[]) => {
    setLoading(true);
    setProgress(0);
    const newResults: VerificationResult[] = [];
    
    // Process in batches of 5 to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(email => verifySingle(email))
      );
      newResults.push(...batchResults);
      setProgress(Math.round(((i + batch.length) / emails.length) * 100));
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    setResults(newResults);
    setLoading(false);
    setProgress(0);
    return newResults;
  }, [verifySingle]);

  const clearResults = useCallback(() => {
    setResults([]);
    setProgress(0);
  }, []);

  return { 
    verifyEmails, 
    verifySingle,
    results, 
    loading, 
    progress,
    clearResults
  };
}

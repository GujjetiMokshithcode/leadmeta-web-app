export interface EmailResult {
  email: string;
  source: string;
}

export const downloadCSV = (emails: EmailResult[], filename: string = 'emails.csv') => {
  // Create CSV content
  const headers = ['Email', 'Source'];
  const rows = emails.map((result) => [result.email, result.source]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (emails: string[]): Promise<boolean> => {
  try {
    const text = emails.join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

export const formatSource = (source: string): string => {
  if (source === 'knowledge-graph') return 'Knowledge Graph';
  if (source === 'answer-box') return 'Answer Box';
  try {
    const url = new URL(source);
    return url.hostname;
  } catch {
    return source;
  }
};

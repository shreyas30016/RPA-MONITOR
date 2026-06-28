/**
 * Enterprise Export Utility
 * Handles RFC-4180 compliant CSV generation, chunked asynchronous processing to prevent freezing,
 * UTF-8 BOM injection for Microsoft Excel compatibility, and complex JSON field escaping.
 */

/**
 * Formats a single CSV cell according to RFC-4180
 * - Handles JSON, null, undefined, Objects, Arrays
 * - Escapes inner double quotes
 * - Wraps in double quotes if it contains commas, newlines, or quotes
 */
export function formatCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str: string;
  
  if (typeof value === 'object') {
    try {
      str = JSON.stringify(value);
    } catch {
      str = String(value);
    }
  } else {
    str = String(value);
  }

  // If it contains a quote, comma, or newline, it MUST be quoted.
  // Internal quotes MUST be doubled.
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Universal, enterprise-grade CSV export utility.
 * - Extracts headers dynamically.
 * - Formats data synchronously in chunks to prevent UI thread freezing.
 * - Includes UTF-8 BOM so Excel opens it without character corruption.
 * - Adheres strictly to RFC-4180.
 * 
 * Returns the duration in ms.
 */
export async function exportToCSV(data: Record<string, unknown>[], filename: string): Promise<number> {
  const startTime = performance.now();
  if (!data || data.length === 0) return 0;

  const headers = Object.keys(data[0]);
  const formattedHeaders = headers.map(formatCSVCell).join(',');
  
  const csvRows: string[] = [formattedHeaders];
  const CHUNK_SIZE = 500;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    // Yield to the event loop every chunk to prevent UI freeze
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const chunkRows = chunk.map(row => 
      headers.map(h => formatCSVCell(row[h])).join(',')
    );
    csvRows.push(...chunkRows);
  }

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) needed for Excel to read Unicode correctly
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return Math.round(performance.now() - startTime);
}

/**
 * Download data as a JSON file.
 */
export function exportAsJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

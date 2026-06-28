import type { RPARow } from '../types/rpa.types';

/**
 * Download data as a real CSV file.
 */
export function exportAsCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val == null ? '' : String(val);
        // Escape quotes and wrap in quotes if it contains commas/quotes/newlines
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Download data as a CSV file asynchronously in chunks to prevent blocking the UI thread.
 * Returns the duration in milliseconds it took to generate and download.
 */
export async function exportAsCSVAsync(data: Record<string, unknown>[], filename: string): Promise<number> {
  const startTime = performance.now();
  if (data.length === 0) return 0;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [headers.join(',')];
  
  const CHUNK_SIZE = 500;
  
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    // Yield to the event loop every chunk to prevent UI freeze
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const chunkRows = chunk.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val == null ? '' : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    csvRows.push(...chunkRows);
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Need to append to body in some browsers for click to work on detached elements
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
  link.download = filename;
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

/**
 * Export RPARow array as CSV with proper column headers.
 */
export function exportRPADataAsCSV(data: RPARow[], filename = 'rpa-export.csv'): void {
  exportAsCSV(data as unknown as Record<string, unknown>[], filename);
}

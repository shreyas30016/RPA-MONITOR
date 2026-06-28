import { formatCurrency, formatPercent, formatNumber } from './formatters';
import type { RPARow } from '../types/rpa.types';
import type { ReactNode } from 'react';

// Automatically formats labels: "annual_savings_usd" -> "Annual Savings (USD)"
export const formatFieldLabel = (field: string): string => {
  return field
    .split('_')
    .map(word => {
      if (word === 'usd') return '(USD)';
      if (word === 'id') return 'ID';
      if (word === 'roi') return 'ROI';
      if (word === 'ai') return 'AI';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const formatFieldValue = (field: keyof RPARow | string, value: unknown): ReactNode => {
  if (value === undefined || value === null || value === '') return '-';
  
  const fieldStr = String(field);

  if (fieldStr.includes('usd') || fieldStr === 'budget') {
    return formatCurrency(Number(value));
  }
  if (fieldStr.includes('percent') || fieldStr === 'roi') {
    return formatPercent(Number(value));
  }
  if (fieldStr === 'robots_deployed' || fieldStr === 'employee_hours_saved') {
    return formatNumber(Number(value));
  }
  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    const isTrue = value === true || value === 'true';
    return isTrue ? 'Yes' : 'No';
  }
  
  return String(value);
};
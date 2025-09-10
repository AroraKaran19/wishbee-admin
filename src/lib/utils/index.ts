import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value}%`;
}

// Get status color classes
export function getStatusColor(status: 'in-stock' | 'out-of-stock'): string {
  switch (status) {
    case 'in-stock':
      return 'text-green-600 bg-green-50';
    case 'out-of-stock':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

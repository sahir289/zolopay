import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function asINR(n: number, isShort: boolean = false): string {
  if (n === undefined || n === null) return '₹ --';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    ...(isShort
      ? {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }
      : {}),
  }).format(n);
}
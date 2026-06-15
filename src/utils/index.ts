import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateBatchNo(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PM${year}${month}${day}${random}`;
}

export function generateFurnaceNo(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `L${year}${month}${day}${random}`;
}

export function calculateDensity(weight: number, volume: number): number {
  if (volume === 0) return 0;
  return parseFloat((weight / volume).toFixed(3));
}

export function checkTolerance(
  measured: number,
  nominal: number,
  tolerance: string
): 'pass' | 'fail' {
  const match = tolerance.match(/([+-]?\d*\.?\d+)/);
  if (!match) return 'pass';
  const tol = parseFloat(match[1]);
  return Math.abs(measured - nominal) <= tol ? 'pass' : 'fail';
}

export function calculateOilContentRate(
  beforeWeight: number,
  afterWeight: number
): number {
  if (beforeWeight === 0) return 0;
  return parseFloat((((afterWeight - beforeWeight) / beforeWeight) * 100).toFixed(2));
}

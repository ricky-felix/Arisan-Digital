/**
 * Utility Functions for Arisan Digital
 *
 * This file contains common utility functions used throughout the application.
 * Includes class name merging, currency formatting, phone formatting, and date formatting.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge
 * This is the standard shadcn/ui utility for combining Tailwind classes
 *
 * @param inputs - Class names to merge
 * @returns Merged class names string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // Conditionally applies classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Indonesian Rupiah currency
 *
 * @param amount - The amount to format
 * @param includeDecimals - Whether to include decimal places (default: false)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(100000) // Returns "Rp 100.000"
 * formatCurrency(1500000) // Returns "Rp 1.500.000"
 * formatCurrency(50000.50, true) // Returns "Rp 50.000,50"
 */
export function formatCurrency(amount: number, includeDecimals = false): string {
  // Handle invalid inputs
  if (isNaN(amount) || !isFinite(amount)) {
    return 'Rp 0';
  }

  // Round to 2 decimal places if including decimals
  const roundedAmount = includeDecimals ? Math.round(amount * 100) / 100 : Math.round(amount);

  // Split into integer and decimal parts
  const parts = roundedAmount.toString().split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1];

  // Format integer part with thousand separators (dots)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Construct final string
  if (includeDecimals && decimalPart) {
    // Pad decimal to 2 digits
    const paddedDecimal = decimalPart.padEnd(2, '0');
    return `Rp ${formattedInteger},${paddedDecimal}`;
  }

  return `Rp ${formattedInteger}`;
}

/**
 * Formats a phone number to Indonesian format
 *
 * Accepts various input formats and normalizes to: +62 XXX-XXXX-XXXX
 *
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 *
 * @example
 * formatPhone('+6281234567890') // Returns "+62 812-3456-7890"
 * formatPhone('081234567890') // Returns "+62 812-3456-7890"
 * formatPhone('6281234567890') // Returns "+62 812-3456-7890"
 */
export function formatPhone(phone: string): string {
  // Handle empty or invalid input
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle Indonesian numbers starting with 0
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // Add country code if missing
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  // Ensure it's a valid Indonesian number (starts with 62)
  if (!cleaned.startsWith('62')) {
    return phone; // Return original if can't format
  }

  // Format: +62 XXX-XXXX-XXXX
  const countryCode = '62';
  const areaCode = cleaned.slice(2, 5); // 3 digits
  const firstPart = cleaned.slice(5, 9); // 4 digits
  const secondPart = cleaned.slice(9, 13); // 4 digits

  // Build formatted string
  let formatted = `+${countryCode}`;

  if (areaCode) {
    formatted += ` ${areaCode}`;
  }

  if (firstPart) {
    formatted += `-${firstPart}`;
  }

  if (secondPart) {
    formatted += `-${secondPart}`;
  }

  return formatted;
}

/**
 * Legacy alias for formatPhone
 * @deprecated Use formatPhone instead
 */
export const formatPhoneNumber = formatPhone;

/**
 * Formats a date to Indonesian format
 *
 * @param date - ISO date string or Date object
 * @returns Formatted date string in Indonesian (e.g., "8 Januari 2026")
 *
 * @example
 * formatDate(new Date('2026-01-08')) // Returns "8 Januari 2026"
 * formatDate('2026-12-25T10:30:00') // Returns "25 Desember 2026"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Indonesian month names
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const day = dateObj.getDate();
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Legacy function - formats date with optional time
 * @deprecated Use formatDate for basic formatting
 */
export function formatDateIndonesian(dateString: string | Date, includeTime = false): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  // Indonesian month names
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let formatted = `${day} ${month} ${year}`;

  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    formatted += `, ${hours}:${minutes}`;
  }

  return formatted;
}

/**
 * Formats a date to relative time in Indonesian
 *
 * @param dateString - ISO date string or Date object
 * @returns Relative time string in Indonesian
 *
 * @example
 * formatRelativeTime(new Date()) // Returns "baru saja"
 * formatRelativeTime(new Date(Date.now() - 60000)) // Returns "1 menit yang lalu"
 * formatRelativeTime(new Date(Date.now() - 86400000)) // Returns "1 hari yang lalu"
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  // Future date
  if (diffInSeconds < 0) {
    return formatDateIndonesian(date);
  }

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'baru saja';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit yang lalu`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  }

  // More than a week, show full date
  return formatDateIndonesian(date);
}

/**
 * Parses and cleans a phone number to +62 format
 *
 * Converts various input formats to standardized +62XXXXXXXXXX format
 *
 * @param phone - The phone number to parse
 * @returns Cleaned phone number in +62 format
 *
 * @example
 * parsePhoneNumber('081234567890') // Returns "+6281234567890"
 * parsePhoneNumber('6281234567890') // Returns "+6281234567890"
 * parsePhoneNumber('+62 812-3456-7890') // Returns "+6281234567890"
 */
export function parsePhoneNumber(phone: string): string {
  // Handle empty or invalid input
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle Indonesian numbers starting with 0
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // Add country code if missing
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  // Return with + prefix
  return `+${cleaned}`;
}

/**
 * Validates Indonesian phone number format
 *
 * @param phone - The phone number to validate
 * @returns True if valid Indonesian phone number
 *
 * @example
 * validateIndonesianPhone('+6281234567890') // Returns true
 * validateIndonesianPhone('081234567890') // Returns true
 * validateIndonesianPhone('123456') // Returns false
 */
export function validateIndonesianPhone(phone: string): boolean {
  // Handle empty or invalid input
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle numbers starting with 0
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // Must start with 62 and be 10-13 digits long (62 + 8-12 digits)
  const phoneRegex = /^62\d{8,12}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Legacy alias for validateIndonesianPhone
 * @deprecated Use validateIndonesianPhone instead
 */
export const isValidIndonesianPhone = validateIndonesianPhone;

/**
 * Truncates text to specified length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText('Hello World', 8) // Returns "Hello..."
 * truncateText('Short', 10) // Returns "Short"
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generates initials from a name
 *
 * @param name - Full name
 * @returns Initials (max 2 characters)
 *
 * @example
 * getInitials('John Doe') // Returns "JD"
 * getInitials('Alice') // Returns "AL"
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '??';
  }

  const words = name.trim().split(/\s+/);

  if (words.length >= 2 && words[0] && words[1]) {
    // Take first letter of first two words
    const firstInitial = words[0][0] || '';
    const secondInitial = words[1][0] || '';
    return (firstInitial + secondInitial).toUpperCase();
  }

  // Single word: take first two letters
  return name.slice(0, 2).toUpperCase();
}

/**
 * Formats a frequency enum to Indonesian text
 *
 * @param frequency - The frequency enum value
 * @returns Formatted frequency text in Indonesian
 *
 * @example
 * formatFrequency('weekly') // Returns "Mingguan"
 * formatFrequency('monthly') // Returns "Bulanan"
 */
export function formatFrequency(frequency: 'weekly' | 'monthly'): string {
  const frequencyMap: Record<string, string> = {
    weekly: 'Mingguan',
    monthly: 'Bulanan',
  };

  return frequencyMap[frequency] || frequency;
}

/**
 * Formats a group status to Indonesian text
 *
 * @param status - The status enum value
 * @returns Formatted status text in Indonesian
 *
 * @example
 * formatGroupStatus('active') // Returns "Aktif"
 * formatGroupStatus('completed') // Returns "Selesai"
 * formatGroupStatus('paused') // Returns "Dijeda"
 */
export function formatGroupStatus(status: 'active' | 'completed' | 'paused'): string {
  const statusMap: Record<string, string> = {
    active: 'Aktif',
    completed: 'Selesai',
    paused: 'Dijeda',
  };

  return statusMap[status] || status;
}

/**
 * Formats a payment status to Indonesian text
 *
 * @param status - The payment status enum value
 * @returns Formatted status text in Indonesian
 *
 * @example
 * formatPaymentStatus('pending') // Returns "Menunggu"
 * formatPaymentStatus('paid') // Returns "Lunas"
 * formatPaymentStatus('late') // Returns "Terlambat"
 */
export function formatPaymentStatus(status: 'pending' | 'paid' | 'late'): string {
  const statusMap: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Lunas',
    late: 'Terlambat',
  };

  return statusMap[status] || status;
}

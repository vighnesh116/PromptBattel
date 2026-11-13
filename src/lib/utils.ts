import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate distance between two GPS coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format a distance in km to a human-readable string
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format a timestamp to a human-readable relative time
 */
export function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Check if a location update is considered recent (within 30 minutes)
 */
export function isLocationRecent(timestamp: string | null): boolean {
  if (!timestamp) return false;
  const then = new Date(timestamp);
  const diffMs = Date.now() - then.getTime();
  return diffMs < 30 * 60 * 1000; // 30 minutes
}

/**
 * Generate an OpenStreetMap link for given coordinates
 */
export function generateMapLink(lat: number, lon: number, zoom = 16): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indian phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Format a date to a readable string
 */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get vehicle type display label
 */
export function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'auto-rickshaw': 'Auto-Rickshaw',
    'car': 'Car',
    'van': 'Van',
    'minibus': 'Minibus',
    'other': 'Other Transport',
  };
  return labels[type] || type;
}

/**
 * Get vehicle type icon name
 */
export function getVehicleIcon(type: string): string {
  const icons: Record<string, string> = {
    'auto-rickshaw': '🛺',
    'car': '🚗',
    'van': '🚐',
    'minibus': '🚌',
    'other': '🚘',
  };
  return icons[type] || '🚘';
}

/**
 * Truncate a string to a max length
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}


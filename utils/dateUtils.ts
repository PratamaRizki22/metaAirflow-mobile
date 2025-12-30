/**
 * Lightweight date formatting utilities
 * Replaces date-fns to reduce bundle size (~39MB -> 0MB)
 */

/**
 * Format date to common patterns
 * @param date - Date object or ISO string
 * @param formatStr - Format pattern (simplified)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM dd, yyyy'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    // Common format patterns
    const patterns: Record<string, string> = {
        // Date formats
        'MMM dd, yyyy': `${months[month]} ${day.toString().padStart(2, '0')}, ${year}`,
        'MMMM dd, yyyy': `${monthsFull[month]} ${day.toString().padStart(2, '0')}, ${year}`,
        'dd/MM/yyyy': `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`,
        'MM/dd/yyyy': `${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`,
        'yyyy-MM-dd': `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,

        // Date with day
        'EEE, MMM dd': `${days[d.getDay()]}, ${months[month]} ${day}`,
        'EEEE, MMMM dd, yyyy': `${days[d.getDay()]}, ${monthsFull[month]} ${day}, ${year}`,

        // Time formats
        'HH:mm': `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        'HH:mm:ss': `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        'hh:mm a': `${(hours % 12 || 12).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`,

        // DateTime formats
        'MMM dd, yyyy HH:mm': `${months[month]} ${day.toString().padStart(2, '0')}, ${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        'dd/MM/yyyy HH:mm': `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    };

    return patterns[formatStr] || patterns['MMM dd, yyyy'];
}

/**
 * Format date relative to now (e.g., "2 hours ago")
 */
export function formatRelative(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    return formatDate(d, 'MMM dd, yyyy');
}

/**
 * Calculate difference between two dates
 */
export function dateDiff(start: Date | string, end: Date | string): { days: number; hours: number; minutes: number } {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    return {
        days: diffDay,
        hours: diffHour % 24,
        minutes: diffMin % 60
    };
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime());
}

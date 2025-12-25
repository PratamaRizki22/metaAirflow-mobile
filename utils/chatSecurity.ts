/**
 * Chat Security & Filtering Utilities
 * Prevents users from bypassing platform payments
 */

// Suspicious keywords that indicate payment bypass attempts
const BLOCKED_KEYWORDS = [
    // Payment methods
    'transfer', 'cod', 'cash', 'tunai', 'bayar langsung', 'dp', 'down payment',
    'rekening', 'bank', 'bca', 'mandiri', 'bri', 'bni', 'cimb',

    // Contact info
    'whatsapp', 'wa', 'telegram', 'line', 'wechat',
    'email', 'gmail', 'yahoo',

    // Direct contact
    'nomor', 'nomer', 'phone', 'hp', 'telp', 'telepon',
    'hubungi', 'contact', 'call',

    // Bypass indicators
    'diluar', 'di luar', 'outside', 'langsung', 'direct',
    'tanpa aplikasi', 'without app', 'bypass',
];

// Regex patterns for contact info
const CONTACT_PATTERNS = [
    /\b\d{10,13}\b/g,                    // Phone numbers (10-13 digits)
    /\b0\d{9,12}\b/g,                    // Indonesian phone (starts with 0)
    /\b\+?\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4,5}\b/g, // Formatted phone
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, // Email
    /\bwa\.me\/\d+\b/gi,                 // WhatsApp links
    /\bt\.me\/\w+\b/gi,                  // Telegram links
];

export interface MessageValidation {
    isAllowed: boolean;
    reason?: string;
    censoredMessage?: string;
    flagged: boolean;
}

/**
 * Check if message contains blocked keywords
 */
export function containsBlockedKeywords(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return BLOCKED_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Check if message contains contact information
 */
export function containsContactInfo(message: string): boolean {
    return CONTACT_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Censor contact information in message
 */
export function censorContactInfo(message: string): string {
    let censored = message;

    CONTACT_PATTERNS.forEach(pattern => {
        censored = censored.replace(pattern, (match) => {
            // Replace with asterisks of same length
            return '*'.repeat(match.length);
        });
    });

    return censored;
}

/**
 * Validate message before sending
 */
export function validateMessage(message: string): MessageValidation {
    const trimmed = message.trim();

    // Empty message
    if (!trimmed) {
        return {
            isAllowed: false,
            reason: 'Message cannot be empty',
            flagged: false,
        };
    }

    // Check for blocked keywords
    if (containsBlockedKeywords(trimmed)) {
        return {
            isAllowed: false,
            reason: 'Message contains restricted keywords. Please use our secure booking system for payments.',
            flagged: true,
        };
    }

    // Check for contact info
    if (containsContactInfo(trimmed)) {
        const censored = censorContactInfo(trimmed);
        return {
            isAllowed: true,
            censoredMessage: censored,
            flagged: true,
            reason: 'Contact information has been censored for your safety',
        };
    }

    // Message is clean
    return {
        isAllowed: true,
        flagged: false,
    };
}

/**
 * Get remaining messages for pre-booking chat
 */
export function getRemainingMessages(sentCount: number, maxMessages: number = 3): number {
    return Math.max(0, maxMessages - sentCount);
}

/**
 * Check if user can send more messages
 */
export function canSendMessage(
    hasActiveBooking: boolean,
    sentCount: number,
    maxMessages: number = 3
): { canSend: boolean; reason?: string } {
    // Unlimited messages if has active booking
    if (hasActiveBooking) {
        return { canSend: true };
    }

    // Check message limit for pre-booking
    if (sentCount >= maxMessages) {
        return {
            canSend: false,
            reason: `You've reached the message limit. Book this property to unlock unlimited chat.`,
        };
    }

    return { canSend: true };
}

import { Platform } from 'react-native';

/**
 * Image source type for React Native Image component
 */
export interface ImageSource {
    uri: string;
    headers?: Record<string, string>;
}

/**
 * Get properly formatted image source for React Native Image component
 * Handles both local file URIs and remote HTTP/HTTPS URLs
 * 
 * @param imageUrl - The image URL from the API (can be local path or cloud URL)
 * @param baseUrl - Optional base URL for the API server (for local storage)
 * @returns ImageSource object with uri and optional headers
 */
export function getImageSource(imageUrl: string | null | undefined, baseUrl?: string): ImageSource | null {
    // Handle null/undefined URLs
    if (!imageUrl || imageUrl.trim() === '') {
        console.log('[ImageUtils] Empty or null image URL');
        return null;
    }

    const trimmedUrl = imageUrl.trim();

    // 1. Handle absolute HTTP/HTTPS URLs (from cloud storage like GCS)
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        console.log('[ImageUtils] Cloud storage URL detected:', trimmedUrl);
        return {
            uri: trimmedUrl,
            // Add headers for better caching and CORS handling
            headers: {
                'Cache-Control': 'max-age=31536000', // Cache for 1 year
            }
        };
    }

    // 2. Handle local file URIs (file://, content://, etc.) - for local image selection
    if (trimmedUrl.startsWith('file://') ||
        trimmedUrl.startsWith('content://') ||
        trimmedUrl.startsWith('ph://') || // iOS Photo Library
        trimmedUrl.startsWith('assets-library://')) { // Legacy iOS
        console.log('[ImageUtils] Local file URI detected:', trimmedUrl.substring(0, 50));
        return {
            uri: trimmedUrl
        };
    }

    // 3. Handle relative paths from local storage (e.g., "/uploads/properties/image.jpg")
    // This happens when images are stored in backend's local storage instead of bucket
    if (trimmedUrl.startsWith('/')) {
        if (!baseUrl) {
            console.warn('[ImageUtils] Relative path detected but no baseUrl provided:', trimmedUrl);
            return null;
        }

        // Remove trailing slash from baseUrl and combine with path
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const fullUrl = `${cleanBaseUrl}${trimmedUrl}`;

        console.log('[ImageUtils] Local storage URL:', fullUrl);
        return {
            uri: fullUrl,
            headers: {
                'Cache-Control': 'max-age=31536000',
            }
        };
    }

    // 4. Handle relative paths without leading slash (e.g., "uploads/properties/image.jpg")
    if (baseUrl && !trimmedUrl.startsWith('http')) {
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const fullUrl = `${cleanBaseUrl}/${trimmedUrl}`;

        console.log('[ImageUtils] Relative path converted to:', fullUrl);
        return {
            uri: fullUrl,
            headers: {
                'Cache-Control': 'max-age=31536000',
            }
        };
    }

    // 5. Fallback: return as-is and log warning
    console.warn('[ImageUtils] Unknown URL format, using as-is:', trimmedUrl);
    return {
        uri: trimmedUrl
    };
}

/**
 * Validate if an image URL is likely to be valid
 * @param imageUrl - The image URL to validate
 * @returns true if URL appears valid
 */
export function isValidImageUrl(imageUrl: string | null | undefined): boolean {
    if (!imageUrl || imageUrl.trim() === '') {
        return false;
    }

    const trimmedUrl = imageUrl.trim();

    // Check for common image URL patterns
    const isHttp = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
    const isFile = trimmedUrl.startsWith('file://');
    const isContent = trimmedUrl.startsWith('content://');
    const isRelative = trimmedUrl.startsWith('/') || trimmedUrl.includes('uploads');

    return isHttp || isFile || isContent || isRelative;
}

/**
 * Get API base URL for constructing full image URLs
 * Uses the same base URL as the API client
 */
export function getApiBaseUrl(): string {
    // Import Config dynamically to avoid circular dependencies
    try {
        const Config = require('../config/app.config').default;
        // Remove '/api' suffix if present to get the root URL
        const baseURL = Config.api.baseURL || 'http://localhost:3000/api';
        return baseURL.replace('/api', '');
    } catch (error) {
        console.error('[ImageUtils] Error getting API base URL:', error);
        return 'http://localhost:3000';
    }
}

/**
 * Extract filename from image URL for logging/debugging
 */
export function getImageFilename(imageUrl: string | null | undefined): string {
    if (!imageUrl) return 'unknown';

    try {
        const parts = imageUrl.split('/');
        return parts[parts.length - 1] || 'unknown';
    } catch {
        return 'unknown';
    }
}

/**
 * Base Service Class
 * Provides common functionality for all service classes
 */
export class BaseService {
    /**
     * Handle API errors with consistent error messages
     */
    protected handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data?.message || 'An error occurred';
            return new Error(message);
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || 'An unexpected error occurred.');
        }
    }

    /**
     * Build query string from filters object
     */
    protected buildQueryString(filters: Record<string, any>): string {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        return params.toString();
    }

    /**
     * Retry logic wrapper for API calls
     */
    protected async retryRequest<T>(
        requestFn: () => Promise<T>,
        retries: number = 2,
        delay: number = 1000
    ): Promise<T> {
        let lastError: any;
        let attemptsLeft = retries;

        while (attemptsLeft > 0) {
            try {
                return await requestFn();
            } catch (error: any) {
                lastError = error;
                attemptsLeft--;

                if (attemptsLeft === 0) {
                    throw this.handleError(error);
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw this.handleError(lastError || new Error('Request failed after retries'));
    }
}

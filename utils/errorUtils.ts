// Error handling utilities
export const handleServiceError = (error: any, defaultMessage: string = 'Operation failed'): Error => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    return new Error(message);
};

export const logError = (context: string, error: any) => {
    if (__DEV__) {
        console.error(`[${context}]`, error.response?.data || error.message || error);
    }
};

// Toast error utility
export const showErrorToast = (showToast: (message: string, type: string) => void, error: any, defaultMessage: string = 'Something went wrong') => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    showToast(message, 'error');
};

import api from './api';

export interface StripeConnectStatus {
    connected: boolean;
    accountId: string | null;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled?: boolean;
}

export interface OnboardingResult {
    accountId: string;
    onboardingUrl: string;
}

class StripeConnectService {
    /**
     * Start Stripe Connect onboarding for landlord
     * @param refreshUrl - Deep link to return if onboarding needs refresh
     * @param returnUrl - Deep link to return after successful onboarding
     */
    async startOnboarding(refreshUrl: string, returnUrl: string): Promise<OnboardingResult> {
        try {
            const response = await api.post('/v1/m/stripe-connect/onboard', {
                refreshUrl,
                returnUrl,
            });

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to start onboarding');
        } catch (error: any) {
            console.error('❌ Stripe Connect onboarding error:', error);
            throw new Error(
                error.response?.data?.message || error.message || 'Failed to start Stripe Connect onboarding'
            );
        }
    }

    /**
     * Get Stripe Connect account status
     */
    async getStatus(): Promise<StripeConnectStatus> {
        try {
            const response = await api.get('/v1/m/stripe-connect/status');

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to get status');
        } catch (error: any) {
            console.error('❌ Stripe Connect status error:', error);
            throw new Error(
                error.response?.data?.message || error.message || 'Failed to get Stripe Connect status'
            );
        }
    }

    /**
     * Get Stripe Dashboard login link
     */
    async getDashboardLink(): Promise<string> {
        try {
            const response = await api.get('/v1/m/stripe-connect/dashboard');

            if (response.data.success) {
                return response.data.data.url;
            }

            throw new Error(response.data.message || 'Failed to get dashboard link');
        } catch (error: any) {
            console.error('❌ Stripe Dashboard link error:', error);
            throw new Error(
                error.response?.data?.message || error.message || 'Failed to get Stripe Dashboard link'
            );
        }
    }

    /**
     * Disconnect Stripe account
     */
    async disconnect(): Promise<void> {
        try {
            const response = await api.post('/v1/m/stripe-connect/disconnect');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to disconnect');
            }
        } catch (error: any) {
            console.error('❌ Stripe disconnect error:', error);
            throw new Error(
                error.response?.data?.message || error.message || 'Failed to disconnect Stripe account'
            );
        }
    }
}

export const stripeConnectService = new StripeConnectService();
export default stripeConnectService;

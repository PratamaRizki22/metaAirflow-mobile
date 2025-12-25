import api from './api';

export interface PaymentIntent {
    clientSecret: string;
    amount: number;
    currency: string;
}

export interface PaymentConfirmation {
    bookingId: string;
    paymentIntentId: string;
    amount: number;
    status: string;
}

class StripeService {
    /**
     * Create payment intent for booking
     */
    async createPaymentIntent(
        bookingId: string,
        amount: number,
        currency: string = 'myr'
    ): Promise<PaymentIntent> {
        try {
            const response = await api.post('/payments/create-intent', {
                bookingId,
                amount,
                currency,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create payment intent');
        }
    }

    /**
     * Confirm payment after successful Stripe payment
     */
    async confirmPayment(
        bookingId: string,
        paymentIntentId: string
    ): Promise<PaymentConfirmation> {
        try {
            const response = await api.post('/payments/confirm', {
                bookingId,
                paymentIntentId,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to confirm payment');
        }
    }

    /**
     * Get payment history for user
     */
    async getPaymentHistory(): Promise<any[]> {
        try {
            const response = await api.get('/payments/history');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get payment history');
        }
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(paymentId: string): Promise<any> {
        try {
            const response = await api.get(`/payments/${paymentId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get payment details');
        }
    }

    /**
     * Cancel payment
     */
    async cancelPayment(paymentIntentId: string): Promise<void> {
        try {
            await api.post('/payments/cancel', {
                paymentIntentId,
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to cancel payment');
        }
    }

    /**
     * Request refund
     */
    async requestRefund(bookingId: string, reason?: string): Promise<any> {
        try {
            const response = await api.post('/payments/refund', {
                bookingId,
                reason,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to request refund');
        }
    }
}

export const stripeService = new StripeService();

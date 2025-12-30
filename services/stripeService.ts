import api from './api';

export interface PaymentSheetParams {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
    publishableKey: string;
    paymentId: string;
}

export interface PaymentConfirmation {
    paymentId: string;
    bookingId: string;
    amount: number;
    status: string;
    paymentIntentId: string;
    completedAt: string;
}

export interface Payment {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentIntentId: string;
    completedAt?: string;
    refundedAt?: string;
    createdAt: string;
    updatedAt: string;
    booking?: {
        id: string;
        propertyId: string;
        checkIn: string;
        checkOut: string;
        totalPrice: number;
        status: string;
        property: {
            title: string;
            city: string;
            state: string;
            images: string[];
        };
    };
}

export interface PaymentHistoryParams {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface PaymentHistoryResponse {
    payments: Payment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface RefundResponse {
    refundId: string;
    amount: number;
    status: string;
    reason?: string;
    createdAt: string;
}

class StripeService {
    /**
     * Get Payment Sheet parameters for booking
     * This calls backend to create PaymentIntent securely
     */
    async getPaymentSheetParams(bookingId: string): Promise<PaymentSheetParams> {
        try {
            const response = await api.post('/v1/m/payments/payment-sheet', {
                bookingId,
            });

            // Backend returns { success: true, data: {...} }
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to initialize payment';
            throw new Error(message);
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
            const response = await api.post('/v1/m/payments/confirm', {
                bookingId,
                paymentIntentId,
            });

            // Backend returns { success: true, data: {...} }
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to confirm payment';
            throw new Error(message);
        }
    }

    /**
     * Get payment history for user with pagination
     */
    async getPaymentHistory(params?: PaymentHistoryParams): Promise<PaymentHistoryResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.status) queryParams.append('status', params.status);

            const url = `/v1/m/payments/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await api.get(url);

            // Backend returns { success: true, data: {...} }
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get payment history';
            throw new Error(message);
        }
    }

    /**
     * Get payment details by ID
     */
    async getPaymentDetails(paymentId: string): Promise<Payment> {
        try {
            const response = await api.get(`/v1/m/payments/${paymentId}`);

            // Backend returns { success: true, data: {...} }
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get payment details';
            throw new Error(message);
        }
    }

    /**
     * Cancel pending payment
     */
    async cancelPayment(paymentIntentId: string): Promise<void> {
        try {
            await api.post('/v1/m/payments/cancel', {
                paymentIntentId,
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to cancel payment';
            throw new Error(message);
        }
    }

    /**
     * Request refund for completed payment
     */
    async requestRefund(bookingId: string, reason?: string): Promise<RefundResponse> {
        try {
            const response = await api.post('/v1/m/payments/refund', {
                bookingId,
                reason,
            });

            // Backend returns { success: true, data: {...} }
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to request refund';
            throw new Error(message);
        }
    }
}

export const stripeService = new StripeService();


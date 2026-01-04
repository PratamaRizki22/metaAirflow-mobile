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
    refundId?: string; // Optional if pending approval
    refundRequestId?: string; // If pending approval
    amount?: number;
    status: string;
    reason?: string;
    createdAt?: string;
    autoRefund?: boolean;
    requiresApproval?: boolean;
    message?: string;
}

export interface RefundRequest {
    id: string;
    leaseId: string;
    requestedBy: string;
    landlordId: string;
    amount: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    tenant: {
        name: string;
        email: string;
        profilePicture?: string;
    };
    lease: {
        id: string;
        property: {
            title: string;
            address: string;
        };
        startDate: string;
        endDate: string;
    };
}

class StripeService {
    /**
     * Get refund requests (Landlord)
     */
    async getRefundRequests(status?: string): Promise<RefundRequest[]> {
        try {
            const response = await api.get('/v1/m/payments/refund-requests', {
                params: { status }
            });
            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get refund requests';
            throw new Error(message);
        }
    }

    /**
     * Process refund request (Landlord)
     */
    async processRefundRequest(requestId: string, approve: boolean, notes?: string): Promise<any> {
        try {
            const response = await api.post(`/v1/m/payments/refund-request/${requestId}/process`, {
                approve,
                notes,
            });
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to process refund request';
            throw new Error(message);
        }
    }
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
        let lastError: any;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔵 Confirming payment (attempt ${attempt}/${maxRetries}):`, { bookingId, paymentIntentId });

                const response = await api.post('/v1/m/payments/confirm', {
                    bookingId,
                    paymentIntentId,
                }, {
                    timeout: 30000, // 30 seconds timeout for payment
                });

                console.log('✅ Payment confirmed successfully:', response.data);
                // Backend returns { success: true, data: {...} }
                return response.data.data || response.data;
            } catch (error: any) {
                lastError = error;
                console.error(`❌ Payment confirmation error (attempt ${attempt}/${maxRetries}):`, {
                    message: error.message,
                    hasResponse: !!error.response,
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url,
                    method: error.config?.method,
                    code: error.code,
                    isNetworkError: !error.response && error.message.includes('Network'),
                    isTimeout: error.code === 'ECONNABORTED',
                });

                // If it's a network error, add more context
                if (!error.response) {
                    console.error('🔴 Network Error Details:', {
                        errorName: error.name,
                        errorCode: error.code,
                        errorStack: error.stack?.substring(0, 200),
                        configExists: !!error.config,
                        baseURL: error.config?.baseURL,
                        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
                    });

                    // Network error - likely device connectivity issue
                    console.error('⚠️  DEVICE NETWORK ISSUE: Cannot reach server. Check:');
                    console.error('  1. Device has internet connection');
                    console.error('  2. Emulator can reach external URLs');
                    console.error('  3. Server is accessible from device network');
                    console.error(`  4. Try: curl ${error.config?.baseURL}${error.config?.url} from device terminal`);
                }

                // Don't retry if it's a 4xx error (client error)
                if (error.response && error.response.status >= 400 && error.response.status < 500) {
                    const message = error.response?.data?.message || error.message || 'Failed to confirm payment';
                    throw new Error(message);
                }

                // Wait before retry (exponential backoff)
                if (attempt < maxRetries) {
                    const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`⏳ Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        // All retries failed
        const message = lastError?.response?.data?.message || lastError?.message || 'Failed to confirm payment after multiple attempts';
        throw new Error(message);
    }

    /**
     * Get payment history for user with pagination
     */
    async getPaymentHistory(params?: PaymentHistoryParams): Promise<PaymentHistoryResponse> {
        try {
            console.log('🔍 Fetching payment history with params:', params);
            const queryParams = new URLSearchParams();

            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.status) queryParams.append('status', params.status);

            const url = `/v1/m/payments/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log('📡 Payment history URL:', url);

            const response = await api.get(url);
            console.log('✅ Payment history response status:', response.status);
            console.log('📦 Payment history response data:', JSON.stringify(response.data, null, 2));

            // Backend returns { success: true, data: {...} }
            const result = response.data.data || response.data;
            console.log('🎯 Processed payment history:', {
                paymentsCount: result.payments?.length || 0,
                pagination: result.pagination
            });

            return result;
        } catch (error: any) {
            console.error('❌ Payment history error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            const message = error.response?.data?.message || 'Failed to get payment history';
            throw new Error(message);
        }
    }

    /**
     * Get payment details by ID
     */
    async getPaymentDetails(paymentId: string): Promise<Payment> {
        try {
            console.log('Fetching payment details for ID:', paymentId);
            const response = await api.get(`/v1/m/payments/${paymentId}`);
            console.log('Payment details API response:', response.data);

            // Backend returns { success: true, data: {...} }
            const paymentData = response.data.data || response.data;

            if (!paymentData) {
                throw new Error('Payment data not found in response');
            }

            return paymentData;
        } catch (error: any) {
            console.error('Payment details API error:', error.response?.data || error.message);
            const message = error.response?.data?.message || error.message || 'Failed to get payment details';
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

    /**
     * Get landlord revenue statistics from actual Stripe payments
     */
    async getLandlordRevenue(startDate?: string, endDate?: string): Promise<any> {
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);

            const url = `/v1/m/payments/landlord/revenue${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await api.get(url);

            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get revenue statistics';
            throw new Error(message);
        }
    }

    /**
     * Get landlord payout summary
     */
    async getLandlordPayoutSummary(): Promise<any> {
        try {
            const response = await api.get('/v1/m/payments/landlord/payout');
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get payout summary';
            throw new Error(message);
        }
    }

    /**
     * Create Stripe Connect account for landlord
     */
    async createConnectAccount(email?: string, country?: string): Promise<any> {
        try {
            const response = await api.post('/v1/m/payments/connect/create', {
                email,
                country: country || 'MY',
                // Use HTTPS URLs that Stripe accepts (will redirect back to app via Universal Links)
                returnUrl: 'https://rentverse-api.loseyourip.com/stripe-connect/success',
                refreshUrl: 'https://rentverse-api.loseyourip.com/stripe-connect/refresh',
            });
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create Connect account';
            throw new Error(message);
        }
    }

    /**
     * Get Stripe Connect account status
     */
    async getConnectAccountStatus(): Promise<any> {
        try {
            const response = await api.get('/v1/m/payments/connect/status');
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get account status';
            throw new Error(message);
        }
    }

    /**
     * Create Stripe dashboard link
     */
    async createDashboardLink(): Promise<any> {
        try {
            const response = await api.post('/v1/m/payments/connect/dashboard');
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create dashboard link';
            throw new Error(message);
        }
    }
}

export const stripeService = new StripeService();


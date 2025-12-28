import api from './api';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
    id: string;
    propertyId: string;
    userId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status: BookingStatus;
    guests: number;
    notes?: string;
    property: {
        id: string;
        title: string;
        address: string;
        city: string;
        images?: string[];
        propertyType: {
            name: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface BookingsResponse {
    success: boolean;
    data: {
        bookings: Booking[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface CreateBookingRequest {
    propertyId: string;
    startDate: string;  // Format: YYYY-MM-DD
    endDate: string;    // Format: YYYY-MM-DD
    message?: string;
}

class BookingService {
    /**
     * Get user's bookings
     */
    async getBookings(
        page: number = 1,
        limit: number = 10,
        status?: BookingStatus,
        role?: 'tenant' | 'owner'
    ): Promise<BookingsResponse> {
        try {
            let url = `/v1/m/bookings?page=${page}&limit=${limit}`;

            if (status) {
                url += `&status=${status}`;
            }

            if (role) {
                url += `&role=${role}`;
            }

            const response = await api.get<BookingsResponse>(url);
            return response.data;
        } catch (error: any) {
            console.error('Get bookings error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<{ success: boolean; data: Booking }> {
        try {
            const response = await api.get<{ success: boolean; data: Booking }>(
                `/v1/m/bookings/${bookingId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get booking error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Create new booking
     */
    async createBooking(data: CreateBookingRequest): Promise<{ success: boolean; data: Booking }> {
        try {
            const response = await api.post<{ success: boolean; data: Booking }>(
                '/v1/m/bookings',
                data
            );
            return response.data;
        } catch (error: any) {
            console.error('Create booking error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post<{ success: boolean; message: string }>(
                `/v1/m/bookings/${bookingId}/cancel`,
                reason ? { reason } : {}
            );
            return response.data;
        } catch (error: any) {
            console.error('Cancel booking error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Approve booking (Owner only)
     */
    async approveBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post<{ success: boolean; message: string }>(
                `/v1/m/bookings/${bookingId}/approve`
            );
            return response.data;
        } catch (error: any) {
            console.error('Approve booking error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Reject booking (Owner only)
     */
    async rejectBooking(bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post<{ success: boolean; message: string }>(
                `/v1/m/bookings/${bookingId}/reject`,
                reason ? { reason } : {}
            );
            return response.data;
        } catch (error: any) {
            console.error('Reject booking error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get bookings by status
     */
    async getBookingsByStatus(status: BookingStatus, page: number = 1, limit: number = 10): Promise<BookingsResponse> {
        return this.getBookings(page, limit, status);
    }

    /**
     * Get pending bookings
     */
    async getPendingBookings(page: number = 1, limit: number = 10): Promise<BookingsResponse> {
        return this.getBookings(page, limit, 'PENDING');
    }

    /**
     * Get approved bookings
     */
    async getApprovedBookings(page: number = 1, limit: number = 10): Promise<BookingsResponse> {
        return this.getBookings(page, limit, 'APPROVED');
    }

    /**
     * Get completed bookings
     */
    async getCompletedBookings(page: number = 1, limit: number = 10): Promise<BookingsResponse> {
        return this.getBookings(page, limit, 'COMPLETED');
    }

    /**
     * Get bookings as tenant (properties I booked)
     */
    async getTenantBookings(page: number = 1, limit: number = 10, status?: BookingStatus): Promise<BookingsResponse> {
        return this.getBookings(page, limit, status, 'tenant');
    }

    /**
     * Get bookings as owner (bookings on my properties)
     */
    async getOwnerBookings(page: number = 1, limit: number = 10, status?: BookingStatus): Promise<BookingsResponse> {
        return this.getBookings(page, limit, status, 'owner');
    }

    /**
     * Upload tenant signature
     */
    async uploadSignature(bookingId: string, signatureUrl: string): Promise<any> {
        try {
            const response = await api.post(
                `/v1/m/bookings/${bookingId}/upload-signature`,
                { signatureUrl }
            );
            return response.data;
        } catch (error: any) {
            console.error('Upload signature error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data?.message || 'An error occurred';
            return new Error(message);
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || 'An unexpected error occurred.');
        }
    }
}

export default new BookingService();

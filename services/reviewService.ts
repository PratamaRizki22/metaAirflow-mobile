import api from './api';

export interface Review {
    id: string;
    propertyId: string;
    userId: string;
    bookingId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
}

export interface CreateReviewRequest {
    bookingId: string;
    propertyId: string;
    rating: number;
    comment: string;
}

export interface UpdateReviewRequest {
    rating: number;
    comment: string;
}

export interface ReviewsResponse {
    success: boolean;
    data: {
        reviews: Review[];
        averageRating: number;
        totalReviews: number;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface PropertyRatingResponse {
    success: boolean;
    data: {
        averageRating: number;
        totalReviews: number;
        ratingDistribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    };
}

class ReviewService {
    /**
     * Create a new review
     */
    async createReview(data: CreateReviewRequest): Promise<{ success: boolean; data: Review }> {
        try {
            const response = await api.post<{ success: boolean; data: Review }>(
                '/v1/m/reviews',
                data
            );
            return response.data;
        } catch (error: any) {
            console.error('Create review error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get reviews for a property
     */
    async getPropertyReviews(
        propertyId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<ReviewsResponse> {
        try {
            const response = await api.get<ReviewsResponse>(
                `/v1/m/properties/${propertyId}/reviews?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get property reviews error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get user's reviews
     */
    async getUserReviews(
        page: number = 1,
        limit: number = 10
    ): Promise<ReviewsResponse> {
        try {
            const response = await api.get<ReviewsResponse>(
                `/v1/m/reviews/my-reviews?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get user reviews error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Update a review
     */
    async updateReview(
        reviewId: string,
        data: UpdateReviewRequest
    ): Promise<{ success: boolean; data: Review }> {
        try {
            const response = await api.put<{ success: boolean; data: Review }>(
                `/v1/m/reviews/${reviewId}`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error('Update review error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Delete a review
     */
    async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.delete<{ success: boolean; message: string }>(
                `/v1/m/reviews/${reviewId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Delete review error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get property rating summary
     */
    async getPropertyRating(propertyId: string): Promise<PropertyRatingResponse> {
        try {
            const response = await api.get<PropertyRatingResponse>(
                `/v1/m/properties/${propertyId}/rating`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get property rating error:', error.response?.data || error.message);
            // Return default values on error
            return {
                success: false,
                data: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                }
            };
        }
    }

    /**
     * Check if user can review a property (has completed booking)
     */
    async canReview(propertyId: string): Promise<{ canReview: boolean; leaseId?: string }> {
        try {
            const response = await api.get<{ success: boolean; data: { canReview: boolean; leaseId?: string } }>(
                `/v1/m/properties/${propertyId}/can-review`
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Check can review error:', error.response?.data || error.message);
            return { canReview: false };
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

export default new ReviewService();

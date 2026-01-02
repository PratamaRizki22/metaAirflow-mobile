import api from './api';
import { BaseService } from './BaseService';

export interface LandlordProfile {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        name: string;
        email: string;
        phone: string | null;
        profilePicture: string | null;
        isHost: boolean;
        createdAt: string;
    };
    stats: {
        propertyCount: number;
        completedBookingsCount: number;
        averageRating: number | null;
        reviewCount: number;
    };
}

export interface LandlordProperty {
    id: string;
    title: string;
    description: string | null;
    address: string;
    city: string;
    state: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number | null;
    images: string[];
    averageRating: number | null;
    propertyType: {
        id: string;
        name: string;
        code: string;
    };
}

export interface LandlordTestimonial {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
    };
    property: {
        id: string;
        title: string;
        images: string[];
    };
}

class UserService extends BaseService {
    /**
     * Get public landlord profile
     */
    async getLandlordProfile(landlordId: string): Promise<{ success: boolean; data: LandlordProfile }> {
        try {
            const response = await api.get<{ success: boolean; data: LandlordProfile }>(
                `/v1/m/users/${landlordId}/profile`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get landlord profile error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get landlord's active properties
     */
    async getLandlordProperties(
        landlordId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        success: boolean;
        data: {
            properties: LandlordProperty[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }> {
        try {
            const queryString = this.buildQueryString({ page, limit });
            const response = await api.get<{
                success: boolean;
                data: {
                    properties: LandlordProperty[];
                    pagination: {
                        page: number;
                        limit: number;
                        total: number;
                        totalPages: number;
                    };
                };
            }>(`/v1/m/users/${landlordId}/properties?${queryString}`);
            return response.data;
        } catch (error: any) {
            console.error('Get landlord properties error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get landlord testimonials
     */
    async getLandlordTestimonials(
        landlordId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        success: boolean;
        data: {
            testimonials: LandlordTestimonial[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }> {
        try {
            const queryString = this.buildQueryString({ page, limit });
            const response = await api.get<{
                success: boolean;
                data: {
                    testimonials: LandlordTestimonial[];
                    pagination: {
                        page: number;
                        limit: number;
                        total: number;
                        totalPages: number;
                    };
                };
            }>(`/v1/m/users/${landlordId}/testimonials?${queryString}`);
            return response.data;
        } catch (error: any) {
            console.error('Get landlord testimonials error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }
}

export const userService = new UserService();

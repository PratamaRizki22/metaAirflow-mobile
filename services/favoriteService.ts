import api from './api';
import { BaseService } from './BaseService';

export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    propertyType: {
        id: string;
        name: string;
    };
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Favorite {
    id: string;
    propertyId: string;
    userId: string;
    favoritedAt: string;
    property: Property;
}

export interface FavoritesResponse {
    success: boolean;
    data: {
        favorites: Favorite[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

class FavoriteService extends BaseService {
    /**
     * Get user's favorite properties
     */
    async getFavorites(page: number = 1, limit: number = 10): Promise<FavoritesResponse> {
        try {
            const queryString = this.buildQueryString({ page, limit });
            const response = await api.get<FavoritesResponse>(
                `/v1/m/users/favorites?${queryString}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get favorites error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Add property to favorites
     */
    async addToFavorites(propertyId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post<{ success: boolean; message: string }>(
                `/v1/m/users/favorites/${propertyId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Add to favorites error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Remove property from favorites
     */
    async removeFromFavorites(propertyId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.delete<{ success: boolean; message: string }>(
                `/v1/m/users/favorites/${propertyId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Remove from favorites error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Check if property is favorited
     */
    async isFavorited(propertyId: string): Promise<boolean> {
        try {
            // Use the property detail endpoint which includes isFavorited field
            const response = await api.get<{ success: boolean; data: any }>(
                `/v1/m/properties/${propertyId}`
            );

            // Check if response is successful and has data
            if (response.data?.success && response.data?.data) {
                return response.data.data.isFavorited === true;
            }

            return false;
        } catch (error: any) {
            // Silently fail - favorite status is not critical
            console.log('Check favorite error:', error.response?.data?.message || error.message);
            return false;
        }
    }

    /**
     * Toggle favorite (add if not favorited, remove if already favorited)
     */
    async toggleFavorite(propertyId: string): Promise<{ success: boolean; message: string; isFavorited: boolean }> {
        try {
            const response = await api.post<{ success: boolean; message: string; isFavorited: boolean }>(
                `/v1/m/properties/${propertyId}/favorite`
            );
            return response.data;
        } catch (error: any) {
            console.error('Toggle favorite error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }


}

export default new FavoriteService();

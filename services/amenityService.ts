import api from './api';

export interface Amenity {
    id: string;
    name: string;
    icon: string;
    category: string;
}

export interface AmenitiesResponse {
    amenities: Amenity[];
    grouped: Record<string, Amenity[]>;
}

class AmenityService {
    /**
     * Get all amenities
     */
    async getAmenities(category?: string): Promise<AmenitiesResponse> {
        try {
            const params = category ? `?category=${encodeURIComponent(category)}` : '';
            const response = await api.get(`/amenities${params}`);
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get amenities';
            throw new Error(message);
        }
    }

    /**
     * Get amenity categories
     */
    async getCategories(): Promise<string[]> {
        try {
            const response = await api.get('/amenities/categories');
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get amenity categories';
            throw new Error(message);
        }
    }
}

export const amenityService = new AmenityService();

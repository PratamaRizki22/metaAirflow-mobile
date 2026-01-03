import api from './api';
import { BaseService } from './BaseService';

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

class AmenityService extends BaseService {
    /**
     * Get all amenities
     */
    async getAmenities(category?: string): Promise<AmenitiesResponse> {
        try {
            const params = category ? `?category=${encodeURIComponent(category)}` : '';
            const response = await api.get(`/v1/m/amenities${params}`);
            return response.data.data || response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get amenity categories
     */
    async getCategories(): Promise<string[]> {
        try {
            const response = await api.get('/v1/m/amenities/categories');
            return response.data.data || response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }
}

export const amenityService = new AmenityService();

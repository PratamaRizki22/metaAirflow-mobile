import api from './api';

export interface Location {
    name: string;
    propertyCount: number;
    latitude?: number;
    longitude?: number;
}

class LocationService {
    /**
     * Get popular locations with property counts
     */
    async getPopularLocations(limit: number = 10): Promise<Location[]> {
        try {
            const response = await api.get(`/properties/locations/popular?limit=${limit}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching popular locations:', error);
            throw error;
        }
    }

    /**
     * Get all unique states with property counts
     */
    async getStates(): Promise<Location[]> {
        try {
            const response = await api.get('/properties/locations/states');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching states:', error);
            throw error;
        }
    }

    /**
     * Get cities for a specific state
     */
    async getCitiesByState(state: string): Promise<Location[]> {
        try {
            const response = await api.get(`/properties/locations/cities?state=${encodeURIComponent(state)}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            throw error;
        }
    }
}

export const locationService = new LocationService();
export default locationService;

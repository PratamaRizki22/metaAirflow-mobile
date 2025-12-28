import api from './api';

export type PropertyStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface PropertyType {
    id: string;
    name: string;
    description?: string;
}

export interface Amenity {
    id: string;
    name: string;
    icon?: string;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
    price: number;
    currencyCode: string;
    propertyTypeId: string;
    propertyType?: PropertyType;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    furnished: boolean;
    isAvailable: boolean;
    status: PropertyStatus;
    images: string[];
    amenities?: Amenity[];
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreatePropertyRequest {
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
    price: number;
    currencyCode: string;
    propertyTypeId: string;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    furnished: boolean;
    isAvailable: boolean;
    status?: PropertyStatus;
    images: string[];
    amenityIds?: string[];
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> { }

export interface PropertiesResponse {
    success: boolean;
    data: {
        properties: Property[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface PropertyResponse {
    success: boolean;
    data: Property;
}

export interface PropertyFilters {
    city?: string;
    state?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyTypeId?: string;
    furnished?: boolean;
    isAvailable?: boolean;
    status?: PropertyStatus;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
    latitude?: number;
    longitude?: number;
    radius?: number; // in kilometers
}

class PropertyService {
    /**
     * Get all properties with filters and pagination
     */
    async getProperties(
        page: number = 1,
        limit: number = 10,
        filters?: PropertyFilters
    ): Promise<PropertiesResponse> {
        try {
            let url = `/v1/properties?page=${page}&limit=${limit}`;

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        url += `&${key}=${value}`;
                    }
                });
            }

            const response = await api.get<PropertiesResponse>(url);
            return response.data;
        } catch (error: any) {
            console.error('Get properties error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get mobile properties with advanced filters (sorting, location, search)
     */
    async getMobileProperties(
        page: number = 1,
        limit: number = 10,
        filters?: PropertyFilters
    ): Promise<PropertiesResponse> {
        let retries = 2;
        let lastError: any;

        while (retries > 0) {
            try {
                let url = `/v1/m/properties?page=${page}&limit=${limit}`;

                if (filters) {
                    Object.entries(filters).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            url += `&${key}=${value}`;
                        }
                    });
                }

                const response = await api.get<PropertiesResponse>(url);
                return response.data;
            } catch (error: any) {
                lastError = error;
                retries--;
                if (retries === 0) {
                    // Silent fail - UI will handle error display
                    throw this.handleError(error);
                }
                // Wait before retry (silent)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw this.handleError(lastError || new Error('Failed to get mobile properties'));
    }

    /**
     * Get property by ID
     */
    async getPropertyById(propertyId: string): Promise<PropertyResponse> {
        try {
            const response = await api.get<PropertyResponse>(`/v1/properties/${propertyId}`);
            return response.data;
        } catch (error: any) {
            console.error('Get property error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Create new property (Landlord/Admin only)
     */
    async createProperty(data: CreatePropertyRequest): Promise<PropertyResponse> {
        try {
            const response = await api.post<PropertyResponse>('/v1/properties', data);
            return response.data;
        } catch (error: any) {
            console.error('Create property error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Update property (Owner/Admin only)
     */
    async updateProperty(propertyId: string, data: UpdatePropertyRequest): Promise<PropertyResponse> {
        try {
            const response = await api.put<PropertyResponse>(`/v1/properties/${propertyId}`, data);
            return response.data;
        } catch (error: any) {
            console.error('Update property error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Delete property (Owner/Admin only)
     */
    async deleteProperty(propertyId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.delete<{ success: boolean; message: string }>(
                `/v1/properties/${propertyId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Delete property error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Search properties
     */
    async searchProperties(
        query: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PropertiesResponse> {
        try {
            const response = await api.get<PropertiesResponse>(
                `/v1/properties/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Search properties error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get properties by city
     */
    async getPropertiesByCity(city: string, page: number = 1, limit: number = 10): Promise<PropertiesResponse> {
        return this.getProperties(page, limit, { city });
    }

    /**
     * Get available properties
     */
    async getAvailableProperties(page: number = 1, limit: number = 10): Promise<PropertiesResponse> {
        return this.getProperties(page, limit, { isAvailable: true, status: 'ACTIVE' });
    }

    /**
     * Get my properties (as landlord)
     */
    async getMyProperties(page: number = 1, limit: number = 10): Promise<PropertiesResponse> {
        try {
            const response = await api.get<PropertiesResponse>(
                `/v1/properties/my-properties?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get my properties error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }



    /**
     * Rate a property
     */
    async rateProperty(
        propertyId: string,
        rating: number,
        review?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post<{ success: boolean; message: string }>(
                `/v1/m/properties/${propertyId}/rate`,
                { rating, review }
            );
            return response.data;
        } catch (error: any) {
            console.error('Rate property error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get nearby properties based on location
     */
    async getNearbyProperties(
        latitude: number,
        longitude: number,
        radius: number = 10,
        limit: number = 20
    ): Promise<PropertiesResponse> {
        try {
            const response = await api.get<PropertiesResponse>(
                `/v1/m/properties/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=${limit}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get nearby properties error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Check property availability for dates
     */
    async checkAvailability(
        propertyId: string,
        startDate: string,
        endDate: string
    ): Promise<{ available: boolean; conflictingBookings: any[] }> {
        try {
            const response = await api.get(
                `/v1/m/properties/${propertyId}/availability`,
                { params: { startDate, endDate } }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Check availability error:', error.response?.data || error.message);
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

export default new PropertyService();

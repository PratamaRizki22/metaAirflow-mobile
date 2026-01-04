import api from './api';
import { BaseService } from './BaseService';

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
    autoApproval: boolean;
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

export interface OccupiedDate {
    start: string;
    end: string;
    status: string;
    tenantName: string;
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
    autoApproval?: boolean;
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

class PropertyService extends BaseService {
    /**
     * Internal method to fetch properties with retry logic
     */
    private async fetchPropertiesWithRetry(
        endpoint: string,
        page: number = 1,
        limit: number = 10,
        filters?: PropertyFilters,
        retries: number = 2
    ): Promise<PropertiesResponse> {
        let lastError: any;
        let attemptsLeft = retries;

        while (attemptsLeft > 0) {
            try {
                let url = `${endpoint}?page=${page}&limit=${limit}`;

                if (filters) {
                    Object.entries(filters).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            url += `&${key}=${encodeURIComponent(value)}`;
                        }
                    });
                }

                console.log('API Request URL:', url);
                const response = await api.get<PropertiesResponse>(url);
                console.log('API Response Status:', response.status);
                console.log('API Response Data:', {
                    success: response.data?.success,
                    propertiesCount: response.data?.data?.properties?.length || 0,
                    totalCount: response.data?.data?.pagination?.total || 0
                });

                return response.data;
            } catch (error: any) {
                lastError = error;
                attemptsLeft--;
                console.error(`API attempt ${retries - attemptsLeft + 1} failed:`, error.response?.data || error.message);

                if (attemptsLeft === 0) {
                    console.error('Fetch properties error:', error.response?.data || error.message);
                    throw this.handleError(error);
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        throw this.handleError(lastError || new Error('Failed to fetch properties'));
    }

    /**
     * Get all properties with filters and pagination (Web endpoint)
     */
    async getProperties(
        page: number = 1,
        limit: number = 10,
        filters?: PropertyFilters
    ): Promise<PropertiesResponse> {
        return this.fetchPropertiesWithRetry('/v1/m/properties', page, limit, filters, 1);
    }

    /**
     * Get mobile properties with advanced filters and retry logic
     */
    async getMobileProperties(
        page: number = 1,
        limit: number = 10,
        filters?: PropertyFilters
    ): Promise<PropertiesResponse> {
        return this.fetchPropertiesWithRetry('/v1/m/properties', page, limit, filters, 2);
    }

    /**
     * Get property by ID
     */
    async getPropertyById(propertyId: string): Promise<PropertyResponse> {
        try {
            console.log('Fetching property:', propertyId);
            const response = await api.get<PropertyResponse>(`/v1/m/properties/${propertyId}`);
            console.log('Property response:', {
                success: response.data?.success,
                hasData: !!response.data?.data,
                dataKeys: response.data?.data ? Object.keys(response.data.data) : []
            });
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
            const response = await api.post<PropertyResponse>('/v1/m/properties', data);
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
            const response = await api.put<PropertyResponse>(`/v1/m/properties/${propertyId}`, data);
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
                `/v1/m/properties/${propertyId}`
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
                `/v1/m/properties/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
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
                `/v1/m/properties/my-properties?page=${page}&limit=${limit}`
            );

            // Check if response is successful
            if (!response.data.success) {
                // Backend returned error with success: false
                console.warn('Backend returned error:', response.data);
                // Return empty properties instead of throwing
                return {
                    success: true,
                    data: {
                        properties: [],
                        pagination: {
                            page: 1,
                            limit: limit,
                            total: 0,
                            totalPages: 0
                        }
                    }
                };
            }

            return response.data;
        } catch (error: any) {
            console.error('Get my properties error:', error.response?.data || error.message);
            // Return empty properties instead of throwing
            return {
                success: true,
                data: {
                    properties: [],
                    pagination: {
                        page: 1,
                        limit: limit,
                        total: 0,
                        totalPages: 0
                    }
                }
            };
        }
    }

    /**
     * Get recently viewed properties
     */
    async getRecentlyViewedProperties(limit: number = 10): Promise<{ success: boolean; data: { properties: Property[]; total: number } }> {
        try {
            const response = await api.get<{ success: boolean; data: { properties: Property[]; total: number } }>(
                `/v1/m/properties/recently-viewed?limit=${limit}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Get recently viewed properties error:', error.response?.data || error.message);
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
     * Get occupied dates for a property
     * Returns different formats based on parameters:
     * - No dates params: Returns { occupiedPeriods: [...] } for CreateBookingScreen
     * - With dates params: Returns OccupiedDate[] for DateRangePicker
     */
    async getOccupiedDates(
        propertyId: string,
        startDate?: string,
        endDate?: string
    ): Promise<{ occupiedPeriods: { startDate: string; endDate: string; status: string }[] } | OccupiedDate[]> {
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get(
                `/v1/m/properties/${propertyId}/occupied-dates`,
                { params }
            );

            // Return the data as-is from backend
            // Backend should return appropriate format based on params
            return response.data.data;
        } catch (error: any) {
            console.error('Get occupied dates error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }
}

export default new PropertyService();

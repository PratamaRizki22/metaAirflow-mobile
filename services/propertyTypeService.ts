import api from './api';
import { BaseService } from './BaseService';

export interface PropertyType {
    id: string;
    name: string;
    icon: string;
    propertyCount: number;
}

class PropertyTypeService extends BaseService {
    /**
     * Get all property types
     */
    async getPropertyTypes(): Promise<PropertyType[]> {
        return this.retryRequest(async () => {
            const response = await api.get('/v1/property-types');
            return response.data.data || response.data;
        }, 2);
    }

    /**
     * Get property type by ID
     */
    async getPropertyTypeById(id: string): Promise<PropertyType> {
        try {
            const response = await api.get(`/v1/property-types/${id}`);
            return response.data.data || response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }
}

export const propertyTypeService = new PropertyTypeService();

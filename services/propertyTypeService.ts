import api from './api';

export interface PropertyType {
    id: string;
    name: string;
    icon: string;
    propertyCount: number;
}

class PropertyTypeService {
    /**
     * Get all property types
     */
    async getPropertyTypes(): Promise<PropertyType[]> {
        try {
            const response = await api.get('/property-types');
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get property types';
            throw new Error(message);
        }
    }

    /**
     * Get property type by ID
     */
    async getPropertyTypeById(id: string): Promise<PropertyType> {
        try {
            const response = await api.get(`/property-types/${id}`);
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get property type';
            throw new Error(message);
        }
    }
}

export const propertyTypeService = new PropertyTypeService();

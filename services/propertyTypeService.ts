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
        let retries = 2;
        while (retries > 0) {
            try {
                const response = await api.get('/v1/property-types');
                return response.data.data || response.data;
            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    const message = error.response?.data?.message || 'Failed to get property types';
                    throw new Error(message);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw new Error('Failed to get property types');
    }

    /**
     * Get property type by ID
     */
    async getPropertyTypeById(id: string): Promise<PropertyType> {
        try {
            const response = await api.get(`/v1/property-types/${id}`);
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get property type';
            throw new Error(message);
        }
    }
}

export const propertyTypeService = new PropertyTypeService();

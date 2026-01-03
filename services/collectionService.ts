import api from './api';
import { BaseService } from './BaseService';

export interface Collection {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        favorites: number;
    };
}

export interface CollectionsResponse {
    success: boolean;
    data: {
        collections: Collection[];
    };
}

export interface CollectionResponse {
    success: boolean;
    message: string;
    data: Collection;
}

class CollectionService extends BaseService {
    /**
     * Get user's collections
     */
    async getCollections(): Promise<CollectionsResponse> {
        try {
            const response = await api.get<CollectionsResponse>('/v1/m/collections');
            return response.data;
        } catch (error: any) {
            console.error('Get collections error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Create a new collection
     */
    async createCollection(name: string): Promise<CollectionResponse> {
        try {
            const response = await api.post<CollectionResponse>('/v1/m/collections', {
                name: name.trim(),
            });
            return response.data;
        } catch (error: any) {
            console.error('Create collection error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Update collection name
     */
    async updateCollection(id: string, name: string): Promise<CollectionResponse> {
        try {
            const response = await api.put<CollectionResponse>(`/v1/m/collections/${id}`, {
                name: name.trim(),
            });
            return response.data;
        } catch (error: any) {
            console.error('Update collection error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Delete a collection
     */
    async deleteCollection(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.delete<{ success: boolean; message: string }>(
                `/v1/m/collections/${id}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Delete collection error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Add property to collection
     */
    async addPropertyToCollection(collectionId: string, propertyId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log('API Call - Add to collection:', {
                collectionId,
                propertyId,
                url: `/v1/m/collections/${collectionId}/properties`
            });
            const response = await api.post<{ success: boolean; message: string }>(
                `/v1/m/collections/${collectionId}/properties`,
                { propertyId }
            );
            console.log('API Response - Add to collection:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Add property to collection error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Remove property from collection
     */
    async removePropertyFromCollection(collectionId: string, propertyId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.delete<{ success: boolean; message: string }>(
                `/v1/m/collections/${collectionId}/properties/${propertyId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Remove property from collection error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }
}

export default new CollectionService();

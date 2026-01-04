import api from './api';

export interface PredictionInput {
    area: number;
    bathrooms: number;
    bedrooms: number;
    furnished: 'Yes' | 'No';
    location: string;
    property_type: string;
}

export interface PredictionResult {
    predicted_price: number;
    currency: string;
    confidence_score: number;
}

export interface PredictionStatus {
    isEnabled: boolean;
    lastUpdated: string;
    updatedBy: string;
}

class PredictionService {
    /**
     * Get prediction service status
     */
    async getStatus(): Promise<PredictionStatus> {
        try {
            const response = await api.get('/v1/m/predictions/status');
            return response.data.data?.status || response.data.status;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get prediction status';
            throw new Error(message);
        }
    }

    /**
     * Predict property price
     */
    async predictPrice(input: PredictionInput): Promise<PredictionResult> {
        try {
            const response = await api.post('/v1/m/predictions/predict', input);
            return response.data.data || response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to predict price';
            throw new Error(message);
        }
    }

    /**
     * Toggle prediction service (Admin only)
     */
    async toggleService(enabled: boolean): Promise<PredictionStatus> {
        try {
            const response = await api.post('/v1/m/predictions/toggle', { enabled });
            return response.data.data?.status || response.data.status;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to toggle prediction service';
            throw new Error(message);
        }
    }
}

export const predictionService = new PredictionService();

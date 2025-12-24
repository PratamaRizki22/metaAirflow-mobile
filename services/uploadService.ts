import api from './api';

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        publicId: string;
        fileName: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        width?: number;
        height?: number;
    };
}

export interface MultipleUploadResponse {
    success: boolean;
    message: string;
    data: {
        files: Array<{
            publicId: string;
            fileName: string;
            originalName: string;
            mimeType: string;
            size: number;
            url: string;
            width?: number;
            height?: number;
        }>;
    };
}

class UploadService {
    /**
     * Upload a single file
     */
    async uploadSingle(file: any, optimize: boolean = true): Promise<UploadResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('optimize', optimize.toString());

            const response = await api.post<UploadResponse>(
                '/v1/m/upload/single',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Upload single file error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Upload multiple files
     */
    async uploadMultiple(files: any[], optimize: boolean = true): Promise<MultipleUploadResponse> {
        try {
            const formData = new FormData();

            files.forEach((file, index) => {
                formData.append('files', file);
            });

            formData.append('optimize', optimize.toString());

            const response = await api.post<MultipleUploadResponse>(
                '/v1/m/upload/multiple',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Upload multiple files error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Upload image from React Native
     */
    async uploadImage(uri: string, optimize: boolean = true): Promise<UploadResponse> {
        try {
            const filename = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            const file = {
                uri,
                name: filename,
                type,
            };

            return await this.uploadSingle(file, optimize);
        } catch (error: any) {
            console.error('Upload image error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Upload multiple images from React Native
     */
    async uploadImages(uris: string[], optimize: boolean = true): Promise<MultipleUploadResponse> {
        try {
            const files = uris.map((uri) => {
                const filename = uri.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                return {
                    uri,
                    name: filename,
                    type,
                };
            });

            return await this.uploadMultiple(files, optimize);
        } catch (error: any) {
            console.error('Upload images error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Upload profile picture (dedicated endpoint)
     */
    async uploadProfilePicture(uri: string): Promise<UploadResponse> {
        try {
            const filename = uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            const formData = new FormData();
            formData.append('file', {
                uri,
                name: filename,
                type,
            } as any);

            const response = await api.post<UploadResponse>(
                '/v1/m/upload/profile-picture',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Upload profile picture error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data?.message || 'Upload failed';
            return new Error(message);
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || 'An unexpected error occurred.');
        }
    }
}

export default new UploadService();

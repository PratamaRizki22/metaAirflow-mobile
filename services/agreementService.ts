import api from './api';

export interface AgreementAnalysis {
    analysis: string;
}

export interface AgreementAnswer {
    answer: string;
}

export interface ExtractedText {
    text: string;
    originalName?: string;
}

class AgreementService {
    /**
     * Extract text from PDF
     */
    async extractText(file: any): Promise<ExtractedText> {
        try {
            const formData = new FormData();

            // Format file for React Native
            const fileObj = {
                uri: file.uri,
                name: file.name || 'document.pdf',
                type: file.mimeType || 'application/pdf',
            };

            formData.append('file', fileObj as any);

            const response = await api.post(
                '/v1/m/agreements/extract',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    transformRequest: (data) => data,
                }
            );

            return response.data.data;
        } catch (error: any) {
            console.error('Extract text error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to extract text from document');
        }
    }

    /**
     * Analyze extracted text using LLM
     */
    async analyze(text: string): Promise<AgreementAnalysis> {
        try {
            const response = await api.post('/v1/m/agreements/analyze', { text });
            return response.data.data;
        } catch (error: any) {
            console.error('Analyze agreement error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to analyze agreement');
        }
    }

    /**
     * Ask question about the agreement
     */
    async ask(text: string, question: string): Promise<AgreementAnswer> {
        try {
            const response = await api.post('/v1/m/agreements/ask', { text, question });
            return response.data.data;
        } catch (error: any) {
            console.error('Ask agreement error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to get answer');
        }
    }
}

export default new AgreementService();

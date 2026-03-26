import axios from 'axios';

/**
 * Handles all communication with the Python extractor microservice.
 * Provides a SINGLE call that returns both transcript AND metadata.
 */
export const transcriptService = {
    /**
     * Extracts BOTH transcript AND metadata in a single microservice call.
     * This is the primary method — avoids double API calls.
     */
    extractAll: async (videoUrl: string): Promise<{ transcript: string; title: string; thumbnail: string }> => {
        const serviceUrl = process.env.EXTRACTOR_SERVICE_URL;
        if (!serviceUrl) {
            throw new Error('EXTRACTOR_SERVICE_URL is not defined in environment variables.');
        }

        console.log(`[INGEST] Delegating extraction to Microservice for: ${videoUrl}`);

        try {
            const response = await axios.post(`${serviceUrl}/extract`, { url: videoUrl }, {
                timeout: 120000 // 2 minutes
            });

            const data = response.data as any;

            if (!data.transcript) {
                throw new Error('Microservice returned no transcript.');
            }

            const transcript: string = data.transcript;
            const title: string = data.metadata?.title || 'Untitled';
            const thumbnail: string = data.metadata?.thumbnail || '';

            console.log(`[INGEST] ✓ Received transcript (${transcript.length} chars), title: "${title}"`);

            return { transcript, title, thumbnail };
        } catch (error: any) {
            console.error('[INGEST] ✗ Microservice Error:', error?.response?.data || error.message);
            throw new Error(`Extraction Failed: ${error?.response?.data?.detail || error.message}`);
        }
    },

    /**
     * @deprecated Use extractAll() to avoid a double API call.
     */
    extractTranscript: async (videoUrl: string): Promise<string> => {
        const result = await transcriptService.extractAll(videoUrl);
        return result.transcript;
    },

    /**
     * @deprecated Use extractAll() to avoid a double API call.
     */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        const result = await transcriptService.extractAll(videoUrl);
        return { title: result.title, thumbnail: result.thumbnail };
    }
};

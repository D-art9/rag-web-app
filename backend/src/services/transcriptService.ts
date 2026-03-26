import axios from 'axios';

/**
 * Handles communication with the Python extractor microservice.
 * Supports a primary URL (Render) and a fallback URL (Home Server/Custom).
 */
export const transcriptService = {
    /**
     * Extracts transcript and metadata.
     * Implements an automatic RETRY logic: if the primary service fails (429 or down),
     * it tries a fallback URL (your home host).
     */
    extractAll: async (videoUrl: string): Promise<{ transcript: string; title: string; thumbnail: string }> => {
        const primaryUrl = process.env.EXTRACTOR_SERVICE_URL;
        const fallbackUrl = process.env.EXTRACTOR_FALLBACK_URL;

        if (!primaryUrl) {
            throw new Error('EXTRACTOR_SERVICE_URL is not defined in environment variables.');
        }

        console.log(`[INGEST] Attempting extraction (PRIMARY) for: ${videoUrl}`);

        try {
            // First attempt to Primary (Render)
            const response = await axios.post(`${primaryUrl}/extract`, { url: videoUrl }, {
                timeout: 120000 // 2 minutes
            });

            return transcriptService._parseResponse(response.data);

        } catch (error: any) {
            const status = error?.response?.status;
            const isRateLimit = status === 429 || error?.response?.data?.detail?.includes('429');

            console.warn(`[INGEST] PRIMARY Extraction Failed (Status: ${status}).`);

            // If we have a fallback URL, use it on 429 (Rate limit) or if primary is down (503/timeout)
            if (fallbackUrl && (isRateLimit || !status)) {
                console.log(`[INGEST] 🔄 Retrying with FALLBACK Service (Home Server): ${fallbackUrl}`);
                try {
                    const fallbackResponse = await axios.post(`${fallbackUrl}/extract`, { url: videoUrl }, {
                        timeout: 120000 // 2 minutes
                    });

                    console.log(`[INGEST] ✓ Fallback Extraction Succeeded!`);
                    return transcriptService._parseResponse(fallbackResponse.data);
                } catch (fallbackError: any) {
                    console.error('[INGEST] ✗ Fallback also failed:', fallbackError.message);
                    throw new Error(`Extraction failed on both primary and fallback. Detail: ${fallbackError.message}`);
                }
            }

            // No fallback or not a retryable error
            throw new Error(`Extraction Failed: ${error?.response?.data?.detail || error.message}`);
        }
    },

    _parseResponse: (data: any) => {
        if (!data.transcript) {
            throw new Error('Microservice returned no transcript.');
        }

        const transcript: string = data.transcript;
        const title: string = data.metadata?.title || 'YouTube Video';
        const thumbnail: string = data.metadata?.thumbnail || '';

        return { transcript, title, thumbnail };
    },

    /** @deprecated Use extractAll() */
    extractTranscript: async (videoUrl: string): Promise<string> => {
        const result = await transcriptService.extractAll(videoUrl);
        return result.transcript;
    },

    /** @deprecated Use extractAll() */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        const result = await transcriptService.extractAll(videoUrl);
        return { title: result.title, thumbnail: result.thumbnail };
    }
};

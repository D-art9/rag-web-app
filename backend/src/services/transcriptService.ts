import axios from 'axios';

/**
 * Handles communication with the Python extractor microservice.
 * Optimized for Localtunnel/Ngrok resilience with automatic retries.
 */
export const transcriptService = {
    /**
     * Helper to perform requests with exponential backoff retry for network/tunnel errors (502, 503, 504).
     */
    _requestWithRetry: async (url: string, data: any, retries: number = 3, delay: number = 2000): Promise<any> => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.post(`${url}/extract`, data, {
                    timeout: 180000, // Increased to 3 minutes for slower tunnels
                    headers: { 'Bypass-Tunnel-Reminder': 'true' } 
                });
                return response.data;
            } catch (error: any) {
                const status = error?.response?.status;
                const isRetryable = status === 502 || status === 503 || status === 504 || !status; // !status captures timeouts/network drops

                if (i < retries - 1 && isRetryable) {
                    console.warn(`[INGEST] Node blink (Status: ${status}) on ${url}. Retrying in ${delay/1000}s... (Attempt ${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, delay * (i + 1))); // Incremental delay
                    continue;
                }
                throw error;
            }
        }
    },

    /**
     * Extracts transcript and metadata.
     * Implements a 2-tier resilience layer:
     * 1. Automatic retries on the primary service.
     * 2. Fallback to a secondary service if primary is truly down or rate-limited.
     */
    extractAll: async (videoUrl: string): Promise<{ transcript: string; title: string; thumbnail: string }> => {
        // SYSTEM OVERRIDE: Render's environment variable is stuck on a zombified localtunnel.
        // We are strictly enforcing this fresh tunnel for production, but keeping localhost for local dev.
        const isLocalDev = process.env.EXTRACTOR_SERVICE_URL?.includes('localhost');
        const primaryUrl = isLocalDev ? 'http://localhost:8000' : 'https://scriptyt-fusion-core.loca.lt';
        const fallbackUrl = process.env.EXTRACTOR_FALLBACK_URL;

        console.log(`[INGEST] Attempting extraction (PRIMARY) via: ${primaryUrl} for: ${videoUrl}`);

        try {
            // First attempt to Primary with internal retry logic
            const data = await transcriptService._requestWithRetry(primaryUrl, { url: videoUrl });
            return transcriptService._parseResponse(data);

        } catch (error: any) {
            const status = error?.response?.status;
            const isRateLimit = status === 429 || error?.response?.data?.detail?.includes('429');

            console.warn(`[INGEST] PRIMARY Extraction Failed definitively (Status: ${status}).`);

            // If we have a fallback URL, use it on 429 (Rate limit) or if primary is dead
            if (fallbackUrl) {
                console.log(`[INGEST] 🔄 Retrying with FALLBACK Service: ${fallbackUrl}`);
                try {
                    const fallbackData = await transcriptService._requestWithRetry(fallbackUrl, { url: videoUrl });
                    console.log(`[INGEST] ✓ Fallback Extraction Succeeded!`);
                    return transcriptService._parseResponse(fallbackData);
                } catch (fallbackError: any) {
                    console.error('[INGEST] ✗ Fallback also failed:', fallbackError.message);
                    throw new Error(`Extraction failed on all routes. Node connectivity issue.`);
                }
            }

            // No fallback, throw original error
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

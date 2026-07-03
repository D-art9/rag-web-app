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
     * Uses RapidAPI YouTube Transcripts endpoint if RAPIDAPI_KEY is configured,
     * otherwise falls back to the local Python extractor microservice.
     */
    extractAll: async (videoUrl: string): Promise<{ transcript: string; title: string; thumbnail: string }> => {
        const apiKey = process.env.RAPIDAPI_KEY;

        // Helper to extract YouTube video ID
        const getYouTubeVideoId = (url: string): string => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : '';
        };

        const videoId = getYouTubeVideoId(videoUrl);

        if (apiKey) {
            console.log(`[INGEST] Fetching transcript via RapidAPI for video: ${videoId}`);
            try {
                const response = await axios.get('https://youtube-transcript.p.rapidapi.com/transcript', {
                    params: {
                        url: videoUrl
                    },
                    headers: {
                        'x-rapidapi-host': 'youtube-transcript.p.rapidapi.com',
                        'x-rapidapi-key': apiKey
                    },
                    timeout: 60000
                });

                const responseData = response.data as any;
                let transcript = '';
                // Handle different response structures: array of lines or raw string
                if (typeof responseData === 'string') {
                    transcript = responseData;
                } else if (responseData.transcript && typeof responseData.transcript === 'string') {
                    transcript = responseData.transcript;
                } else if (responseData.body && typeof responseData.body === 'string') {
                    transcript = responseData.body;
                } else {
                    const lines = responseData.lines || responseData.body || (Array.isArray(responseData) ? responseData : null);
                    if (Array.isArray(lines)) {
                        transcript = lines.map((item: any) => typeof item === 'string' ? item : (item.text || '')).join(' ');
                    } else {
                        // Direct transcript array check
                        const transcriptArray = responseData.transcript || responseData.captions;
                        if (Array.isArray(transcriptArray)) {
                            transcript = transcriptArray.map((item: any) => typeof item === 'string' ? item : (item.text || '')).join(' ');
                        } else {
                            throw new Error('Unexpected RapidAPI response format');
                        }
                    }
                }

                if (!transcript) {
                    throw new Error('No transcript found in RapidAPI response');
                }

                const title = responseData.title || 'YouTube Video';
                const thumbnail = responseData.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

                return {
                    transcript: transcript.trim(),
                    title,
                    thumbnail
                };
            } catch (error: any) {
                console.error('[INGEST] RapidAPI Extraction Failed:', error.message);
                throw new Error(`RapidAPI Extraction Failed: ${error?.response?.data?.message || error.message}`);
            }
        }

        // FALLBACK: Local microservice flow if no RapidAPI key is set
        const isLocalDev = process.env.EXTRACTOR_SERVICE_URL?.includes('localhost');
        const primaryUrl = isLocalDev ? 'http://localhost:8000' : 'https://scriptyt-extractor-node.loca.lt';
        const fallbackUrl = process.env.EXTRACTOR_FALLBACK_URL;

        console.log(`[INGEST] Attempting extraction (PRIMARY) via: ${primaryUrl} for: ${videoUrl}`);

        try {
            const data = await transcriptService._requestWithRetry(primaryUrl, { url: videoUrl });
            return transcriptService._parseResponse(data);

        } catch (error: any) {
            const status = error?.response?.status;
            console.warn(`[INGEST] PRIMARY Extraction Failed definitively (Status: ${status}).`);

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

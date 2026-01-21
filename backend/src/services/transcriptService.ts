import { Innertube, UniversalCache } from 'youtubei.js';

// Singleton instance
let innertube: Innertube | null = null;

const getInnertube = async () => {
    if (!innertube) {
        console.log('[INGEST] Initializing YouTubei.js (Innertube)...');
        innertube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            // Inject tokens to bypass "FAILED_PRECONDITION" (Bot detection)
            po_token: process.env.YOUTUBE_PO_TOKEN,
            visitor_data: process.env.YOUTUBE_VISITOR_DATA
        });
        console.log('[INGEST] YouTubei.js initialized with tokens:', !!process.env.YOUTUBE_PO_TOKEN);
    }
    return innertube;
};

export const transcriptService = {
    /**
     * Extracts transcript using YouTubei.js (Innertube).
     * This library mimics the internal Android/Web clients and is highly robust.
     */
    extractTranscript: async (videoUrl: string): Promise<string> => {
        try {
            console.log(`[INGEST] Starting transcript extraction for: ${videoUrl}`);

            // Extract Video ID
            const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            const yt = await getInnertube();

            console.log(`[INGEST] Fetching video info for ID: ${videoId}`);
            const info = await yt.getInfo(videoId);

            console.log(`[INGEST] Fetching transcript data...`);
            const transcriptData = await info.getTranscript();

            if (!transcriptData || !transcriptData.transcript) {
                throw new Error('No transcript available for this video.');
            }

            // The transcript data typically contains segments with text
            // We need to access the underlying content array
            const segments = transcriptData.transcript.content?.body?.initial_segments || [];

            // Map and join the text
            const fullText = segments
                .map((seg: any) => seg.snippet?.text || '')
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            console.log(`[INGEST] ✓ Transcript extracted. Length: ${fullText.length} chars.`);
            return fullText;

        } catch (error: any) {
            console.error('Transcript Service Error Detail:', error);

            // Handle specific errors
            if (error.message.includes('Sign in') || error.message.includes('cookies') || error.message.includes('No transcript')) {
                throw new Error('Could not retrieve transcript. YouTube may be blocking the request or no captions exist.');
            }

            throw new Error('Could not retrieve transcript. ' + (error.message || 'Unknown error'));
        }
    },

    /**
     * Extracts video metadata using YouTubei.js (Innertube)
     */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        try {
            console.log(`[METADATA] Starting metadata fetch for: ${videoUrl}`);

            // Extract Video ID
            const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (!videoId) {
                return { title: 'YouTube Video', thumbnail: '' };
            }

            const yt = await getInnertube();
            const info = await yt.getBasicInfo(videoId);

            const title = info.basic_info.title || 'Untitled Video';
            // Get the largest thumbnail
            const thumbnail = info.basic_info.thumbnail?.[0]?.url || '';

            console.log(`[METADATA] ✓ Metadata received. Title: "${title}"`);

            return {
                title,
                thumbnail
            };
        } catch (error: any) {
            console.error('[METADATA] ✗ Failed to fetch metadata:', error.message);

            // Fallback
            return {
                title: 'YouTube Video',
                thumbnail: ''
            };
        }
    }
};

import fs from 'fs';
import path from 'path';
import YtDlpWrap from 'yt-dlp-wrap';
import axios from 'axios';

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.resolve(__dirname, '../../', binaryName);
const ytDlpWrap = new YtDlpWrap(binaryPath);

/**
 * Ensures the yt-dlp binary exists. Downloads it DIRECTLY (bypassing GitHub API rate limits).
 */
const ensureBinary = async () => {
    if (!fs.existsSync(binaryPath)) {
        console.log('[INGEST] yt-dlp binary not found. Downloading via Direct Link...');
        // Direct download URL for the latest release binary (Linux/Unix for Render)
        const downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'; // Linux binary

        try {
            const writer = fs.createWriteStream(binaryPath);
            const response = await axios({
                url: downloadUrl,
                method: 'GET',
                responseType: 'stream'
            });

            (response.data as any).pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    writer.close(); // Ensure file descriptor is closed
                    resolve(null);
                });
                writer.on('error', reject);
            });

            // Wait a small moment for OS to release file lock (Fix ETXTBSY)
            await new Promise(r => setTimeout(r, 500));

            // Make executable
            if (!isWindows) {
                fs.chmodSync(binaryPath, '755');
            }
            console.log('[INGEST] yt-dlp binary downloaded successfully.');
        } catch (err) {
            console.error('[INGEST] Failed to download yt-dlp binary:', err);
            throw new Error('Failed to download yt-dlp dependency.');
        }
    }
};


import axios from 'axios';

export const transcriptService = {
    /**
     * Extracts transcript and metadata by calling the Python Microservice.
     */
    extractTranscript: async (videoUrl: string): Promise<string> => {
        try {
            console.log(`[INGEST] Delegating extraction to Microservice for: ${videoUrl}`);
            const serviceUrl = process.env.EXTRACTOR_SERVICE_URL;

            if (!serviceUrl) {
                throw new Error("EXTRACTOR_SERVICE_URL is not defined in environment variables.");
            }

            // Call Python Service
            const response = await axios.post(`${serviceUrl}/extract`, {
                url: videoUrl
            }, {
                timeout: 120000 // 2 minutes timeout for safety
            });

            const data = response.data;
            if (!data.transcript) {
                throw new Error("Microservice returned no transcript.");
            }

            console.log(`[INGEST] ✓ Microservice returned ${data.transcript.length} chars.`);
            return data.transcript;

        } catch (error: any) {
            console.error('[INGEST] ✗ Microservice Error:', error?.response?.data || error.message);
            throw new Error(`Extraction Failed: ${error?.response?.data?.detail || error.message}`);
        }
    },

    /**
     * Extracts metadata via Microservice
     * (Optimized: In the future, we should combine this with extractTranscript to avoid 2 calls, 
     * but for now we keep the interface same)
     */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        try {
            console.log(`[METADATA] Fetching metadata via Microservice...`);
            const serviceUrl = process.env.EXTRACTOR_SERVICE_URL;
            if (!serviceUrl) throw new Error("EXTRACTOR_SERVICE_URL missing.");

            // We call the same endpoint because our Python service returns BOTH.
            // This is slightly inefficient (double work) but keeps the code clean for now.
            // Ideally, we should cache the result or have a separate /metadata endpoint.
            const response = await axios.post(`${serviceUrl}/extract`, {
                url: videoUrl
            });

            const meta = response.data.metadata;
            return {
                title: meta.title || 'Untitled',
                thumbnail: meta.thumbnail || ''
            };
        } catch (error: any) {
            console.error('[METADATA] ✗ Failed to fetch metadata:', error.message);
            return {
                title: 'YouTube Video',
                thumbnail: ''
            };
        }
    }
};

import fs from 'fs';
import path from 'path';
import YtDlpWrap from 'yt-dlp-wrap';
import { YoutubeTranscript } from 'youtube-transcript';

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.resolve(__dirname, '../../', binaryName);
const ytDlpWrap = new YtDlpWrap(binaryPath);

/**
 * Ensures the yt-dlp binary exists. Downloads it if missing.
 */
const ensureBinary = async () => {
    if (!fs.existsSync(binaryPath)) {
        console.log('[INGEST] yt-dlp binary not found. Downloading...');
        await YtDlpWrap.downloadFromGithub(binaryPath);
        console.log('[INGEST] yt-dlp binary downloaded successfully.');
    }
};

/**
 * Helper to get a WRITABLE path for cookies.
 */
const getWritableCookiesPath = (): string | null => {
    // 1. Check for secret file (Render)
    const secretPath = '/etc/secrets/cookies.txt';
    if (fs.existsSync(secretPath)) {
        const tempPath = path.resolve(__dirname, `cookies_${Date.now()}.txt`);
        try {
            fs.copyFileSync(secretPath, tempPath);
            return tempPath;
        } catch (e) {
            console.error('[INGEST] Failed to copy secret cookies to temp:', e);
        }
    }
    // 2. Local dev fallback
    const envPath = path.resolve(__dirname, '../../cookies.txt');
    if (fs.existsSync(envPath)) return envPath;

    return null;
};

export const transcriptService = {
    /**
     * Extracts transcript using 'youtube-transcript' library
     * This is more robust against 429/bot blocks than yt-dlp for just text.
     */
    extractTranscript: async (videoUrl: string): Promise<string> => {
        try {
            console.log(`[INGEST] Starting transcript extraction for: ${videoUrl}`);

            // Extract Video ID from URL
            const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            console.log(`[INGEST] Fetching transcript for ID: ${videoId}`);

            // Use youtube-transcript library
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

            console.log(`[INGEST] ✓ Transcript fetched via library. Items: ${transcriptItems.length}`);

            // Join text
            const fullText = transcriptItems.map(item => item.text).join(' ');

            // Clean up text (decode HTML entities like &amp; -> &)
            const cleanText = fullText
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

            console.log(`[INGEST] ✓ Text processed, length: ${cleanText.length} chars`);

            return cleanText;

        } catch (error: any) {
            console.error('Transcript Service Error Detail:', error);

            if (error.message.includes('Sign in') || error.message.includes('cookies')) {
                throw new Error('YouTube is blocking this request (Bot Detection). Please try a different video or try again later.');
            }

            throw new Error('Could not retrieve transcript. ' + (error.message || 'Unknown error'));
        }
    },

    /**
     * Extracts video metadata (title, thumbnail) using yt-dlp
     * Uses 'android' client as it is generally lightweight for metadata
     */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        const cookiesPath = getWritableCookiesPath();
        try {
            console.log(`[METADATA] Starting metadata fetch for: ${videoUrl}`);
            await ensureBinary();

            const args = [
                videoUrl,
                '--dump-json',
                '--extractor-args', 'youtube:player_client=android', // Android client for metadata
                '--no-playlist'
            ];

            // Try adding cookies if available, though android client might ignore/fail with them
            // If it fails with cookies, we might retry without them, but let's keep it simple for now.
            // Actually, for consistency with our previous "fix", lets NOT send cookies to android client 
            // to avoid "client does not support cookies" error.

            const output = await ytDlpWrap.execPromise(args);
            const metadata = JSON.parse(output);

            console.log(`[METADATA] ✓ Metadata received. Title: "${metadata.title}"`);

            return {
                title: metadata.title || 'Untitled Video',
                thumbnail: metadata.thumbnail || ''
            };
        } catch (error: any) {
            // Clean up cookies if created
            if (cookiesPath && cookiesPath.includes('cookies_')) {
                try { fs.unlinkSync(cookiesPath); } catch (e) { }
            }

            console.error('[METADATA] ✗ Failed to fetch metadata:', error.message);
            console.log('[METADATA] Falling back to default metadata.');

            // Return dummy metadata so the ingest process doesn't crash completely
            // The transcript is the most important part
            return {
                title: 'YouTube Video (Metadata Pending)',
                thumbnail: ''
            };
        }
    }
};

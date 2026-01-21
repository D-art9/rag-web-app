import fs from 'fs';
import path from 'path';
import YtDlpWrap from 'yt-dlp-wrap';

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
 * Helper to get a WRITABLE path for cookies from Environment Variable.
 */
const getCookiesPath = (): string | null => {
    if (process.env.YOUTUBE_COOKIE) {
        const cookieContent = process.env.YOUTUBE_COOKIE;
        // Create a Netscape format cookie file content roughly, or just pass the header string if yt-dlp supports it?
        // yt-dlp --cookies-from-browser is complex on server. 
        // Best way: If user provided the "header" string (Cookie: ...), we can try to pass it as header.
        // BUT, yt-dlp --add-header "Cookie: ..." works best.
        return null; // We will use --add-header for simplicity
    }
    return null;
};

export const transcriptService = {
    /**
     * Extracts transcript using yt-dlp with PROXY and COOKIE support.
     */
    extractTranscript: async (videoUrl: string): Promise<string> => {
        try {
            console.log(`[INGEST] Starting transcript extraction for: ${videoUrl}`);
            await ensureBinary();

            // Prepare arguments
            const args = [
                videoUrl,
                '--write-auto-sub', // Get auto-generated captions
                '--sub-lang', 'en',
                '--skip-download',  // Don't download video
                '--output', path.resolve(__dirname, '../../temp/%(id)s'), // Output to temp
            ];

            // 1. ADD PROXY (The King)
            if (process.env.YOUTUBE_PROXY) {
                console.log('[INGEST] Using Proxy for yt-dlp.');
                args.push('--proxy', process.env.YOUTUBE_PROXY);
            }

            // 2. ADD COOKIES (The Queen)
            if (process.env.YOUTUBE_COOKIE) {
                console.log('[INGEST] Using Cookie for yt-dlp.');
                args.push('--add-header', `Cookie:${process.env.YOUTUBE_COOKIE}`);
            }

            // Execute
            console.log('[INGEST] Running yt-dlp...');
            await ytDlpWrap.execPromise(args);

            // Find the downloaded VTT file
            // Expected filename format: temp/VIDEOID.en.vtt
            const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : '';

            const tempDir = path.resolve(__dirname, '../../temp');
            // Try explicit filename first
            const vttPath = path.join(tempDir, `${videoId}.en.vtt`);

            if (!fs.existsSync(vttPath)) {
                throw new Error('Transcript file not created by yt-dlp.');
            }

            const vttContent = fs.readFileSync(vttPath, 'utf-8');

            // Cleanup
            try { fs.unlinkSync(vttPath); } catch (e) { }

            // Parse VTT (Simple)
            const lines = vttContent.split('\n');
            const textLines = lines.filter(line => {
                const l = line.trim();
                return l && !l.startsWith('WEBVTT') && !l.startsWith('NOTE') && !l.includes('-->') && !/^\d+$/.test(l);
            });
            const uniqueLines = [...new Set(textLines.map(l => l.replace(/<\/?[^>]+(>|$)/g, "")))]; // Dedupe and strip tags
            const fullText = uniqueLines.join(' ');

            console.log(`[INGEST] ✓ Transcript extracted. Length: ${fullText.length} chars.`);
            return fullText;

        } catch (error: any) {
            console.error('Transcript Service Error Detail:', error);
            if (error.message.includes('Sign in') || error.message.includes('429') || error.message.includes('bot')) {
                throw new Error('YouTube blocked the request. Please check Proxy/Cookie settings.');
            }
            throw new Error('Could not retrieve transcript. ' + (error.message || 'Unknown error'));
        }
    },

    /**
     * Extracts video metadata using yt-dlp with PROXY support
     */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        try {
            console.log(`[METADATA] Starting metadata fetch for: ${videoUrl}`);
            await ensureBinary();

            const args = [
                videoUrl,
                '--dump-json',
                '--no-playlist'
            ];

            // 1. ADD PROXY
            if (process.env.YOUTUBE_PROXY) {
                args.push('--proxy', process.env.YOUTUBE_PROXY);
            }

            // 2. ADD COOKIES
            if (process.env.YOUTUBE_COOKIE) {
                args.push('--add-header', `Cookie:${process.env.YOUTUBE_COOKIE}`);
            }

            const output = await ytDlpWrap.execPromise(args);
            const metadata = JSON.parse(output);

            console.log(`[METADATA] ✓ Metadata received. Title: "${metadata.title}"`);

            return {
                title: metadata.title || 'Untitled Video',
                thumbnail: metadata.thumbnail || ''
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

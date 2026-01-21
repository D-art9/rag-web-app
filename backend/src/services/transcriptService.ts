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
                let proxyUrl = process.env.YOUTUBE_PROXY;
                if (!proxyUrl.startsWith('http')) proxyUrl = `http://${proxyUrl}`;
                args.push('--proxy', proxyUrl);
            }

            // 2. ADD COOKIES (The Queen)
            if (process.env.YOUTUBE_COOKIE) {
                console.log('[INGEST] Using Cookie for yt-dlp.');
                // Quote the cookie string to be safe, though exec functions usually handle args array well
                args.push('--add-header', `Cookie:${process.env.YOUTUBE_COOKIE}`);
                args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
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
                throw new Error('Transcript file not created by yt-dlp (Request might have failed silently or no captions).');
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
            const errorMessage = error?.message || String(error);
            if (errorMessage.includes('Sign in') || errorMessage.includes('429') || errorMessage.includes('bot')) {
                throw new Error('YouTube blocked the request. Please check Proxy/Cookie settings.');
            }
            throw new Error('Could not retrieve transcript. ' + errorMessage);
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
                let proxyUrl = process.env.YOUTUBE_PROXY;
                if (!proxyUrl.startsWith('http')) proxyUrl = `http://${proxyUrl}`;
                args.push('--proxy', proxyUrl);
            }

            // 2. ADD COOKIES
            if (process.env.YOUTUBE_COOKIE) {
                args.push('--add-header', `Cookie:${process.env.YOUTUBE_COOKIE}`);
                args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
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

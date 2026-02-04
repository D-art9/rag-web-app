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

            // Core Argumnets
            const baseArgs = [
                videoUrl,
                '--write-auto-sub',
                '--sub-lang', 'en',
                '--skip-download',
                '--output', path.resolve(__dirname, '../../temp/%(id)s'),
                '--socket-timeout', '30',
                // BYPASS OPTIONS
                '--extractor-args', 'youtube:player_client=android', // <--- MAGIC FIX? (Spoofs Mobile App)
            ];

            // Execute using Helper (It handles Auth/Proxy)
            await executeWithFallback(baseArgs, false);

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

            const baseArgs = [
                videoUrl,
                '--dump-json',
                '--no-playlist',
                // BYPASS OPTIONS
                '--extractor-args', 'youtube:player_client=android', // <--- MAGIC FIX?
            ];

            const output = await executeWithFallback(baseArgs, true); // true = return output
            const metadata = JSON.parse(output);

            console.log(`[METADATA] ✓ Metadata received.`);

            return {
                title: metadata.title || 'Untitled Video',
                thumbnail: metadata.thumbnail || ''
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

/**
 * Robust Execution Helper with Proxy Fallback AND Auth Injection
 */
async function executeWithFallback(baseArgs: string[], returnOutput: boolean = false): Promise<string> {
    const hasProxy = !!process.env.YOUTUBE_PROXY;
    const proxyUrl = process.env.YOUTUBE_PROXY ?
        (process.env.YOUTUBE_PROXY.startsWith('http') ? process.env.YOUTUBE_PROXY : `http://${process.env.YOUTUBE_PROXY}`)
        : null;

    // Construct Auth Args (Shared for both attempts)
    const authArgs: string[] = [];
    if (process.env.YOUTUBE_COOKIE) {
        authArgs.push('--add-header', `Cookie:${process.env.YOUTUBE_COOKIE}`);
        // REMOVED USER-AGENT: Let yt-dlp pick the best one for 'android' client
    }

    // Function to run a specific attempt
    const runAttempt = async (attemptName: string, extraArgs: string[]) => {
        try {
            console.log(`[INGEST] ${attemptName}...`);
            const finalArgs = [...baseArgs, ...authArgs, ...extraArgs];
            if (returnOutput) {
                return await ytDlpWrap.execPromise(finalArgs);
            } else {
                await ytDlpWrap.execPromise(finalArgs);
                return '';
            }
        } catch (error: any) {
            throw error;
        }
    };

    // Attempt 1: WITH Proxy
    if (hasProxy && proxyUrl) {
        try {
            return await runAttempt('Attempt 1 (Proxy)', ['--proxy', proxyUrl]);
        } catch (error: any) {
            const msg = error?.message || '';
            console.warn(`[INGEST] ⚠️ Attempt 1 failed. Retrying Direct...`);
            // Fallthrough to Attempt 2
        }
    }

    // Attempt 2: DIRECT (No Proxy)
    try {
        return await runAttempt('Attempt 2 (Direct)', []);
    } catch (error: any) {
        throw error;
    }
}

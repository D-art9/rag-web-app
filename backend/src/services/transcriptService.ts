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
 * Helper to get a WRITABLE path for cookies.
 * yt-dlp tries to update the cookies file, so we cannot use the read-only /etc/secrets directly.
 */
const getWritableCookiesPath = (): string | null => {
    // 1. Check for secret file (Render)
    const secretPath = '/etc/secrets/cookies.txt';
    if (fs.existsSync(secretPath)) {
        // Copy to a writable temp location in the app directory
        const tempPath = path.resolve(__dirname, `cookies_${Date.now()}.txt`);
        try {
            console.log(`[INGEST] Copying read-only cookies from ${secretPath} to ${tempPath}`);
            fs.copyFileSync(secretPath, tempPath);
            return tempPath;
        } catch (e) {
            console.error('[INGEST] Failed to copy secret cookies to temp:', e);
        }
    }

    // 2. Check for temp cookies file from Env Var (Fallback)
    const envPath = path.resolve(__dirname, '../../cookies.txt');
    if (process.env.YOUTUBE_COOKIES_CONTENT) {
        if (!fs.existsSync(envPath)) {
            console.log('[INGEST] Writing cookies from Env Var to file...');
            fs.writeFileSync(envPath, process.env.YOUTUBE_COOKIES_CONTENT);
        }
        return envPath;
    }

    // 3. Local dev fallback
    if (fs.existsSync(envPath)) return envPath;

    return null;
};

/**
 * Handles external data extraction using yt-dlp.
 */
export const transcriptService = {
    extractTranscript: async (videoUrl: string): Promise<string> => {
        const vttPath = path.resolve(__dirname, `temp_${Date.now()}.vtt`);
        const cookiesPath = getWritableCookiesPath();

        try {
            console.log(`[INGEST] Starting transcript extraction for: ${videoUrl}`);
            await ensureBinary();
            console.log(`[INGEST] Binary verified, executing yt-dlp command...`);

            // Build arguments
            const args = [
                videoUrl,
                '--write-auto-sub',
                '--write-sub',
                '--sub-lang', 'en',
                '--skip-download',
                // Mimic iOS client (often supports cookies better than Android and bypasses 429s)
                '--extractor-args', 'youtube:player_client=ios',
                '--output', vttPath
            ];

            // Append cookies if found
            if (cookiesPath) {
                console.log(`[INGEST] Using cookies from writable path: ${cookiesPath}`);
                args.push('--cookies', cookiesPath);
            }

            await ytDlpWrap.execPromise(args);

            // Clean up writable cookies if they were created in temp dir (filename contains timestamp)
            if (cookiesPath && cookiesPath.includes('cookies_')) {
                try { fs.unlinkSync(cookiesPath); } catch (e) { }
            }

            console.log(`[INGEST] yt-dlp command completed, searching for VTT file...`);

            // yt-dlp appends .en.vtt or similar to the output filename
            // We need to find the actual file that was created.
            const dir = path.dirname(vttPath);
            const files = fs.readdirSync(dir);
            const generatedFile = files.find(f => f.startsWith(path.basename(vttPath)) && f.endsWith('.vtt'));

            if (!generatedFile) {
                console.warn(`[INGEST] ✗ No transcript file created for ${videoUrl}`);
                throw new Error('This video does not have available captions and cannot be processed.');
            }

            console.log(`[INGEST] ✓ Found VTT file: ${generatedFile}`);

            const fullPath = path.join(dir, generatedFile);
            const vttContent = fs.readFileSync(fullPath, 'utf-8');

            console.log(`[INGEST] ✓ VTT file read, size: ${vttContent.length} bytes`);

            // Parse VTT to plain text
            const cleanText = parseVtt(vttContent);

            console.log(`[INGEST] ✓ Successfully extracted ${cleanText.length} characters.`);

            // Cleanup
            fs.unlinkSync(fullPath);
            console.log(`[INGEST] ✓ Cleaned up temp file.`);

            return cleanText;

        } catch (error: any) {
            // Cleanup cookies
            try {
                if (cookiesPath && cookiesPath.includes('cookies_')) fs.unlinkSync(cookiesPath);
            } catch (e) { }

            // Cleanup vtt
            try {
                const dir = path.dirname(vttPath);
                const files = fs.readdirSync(dir);
                const generatedFile = files.find(f => f.startsWith(path.basename(vttPath)));
                if (generatedFile) fs.unlinkSync(path.join(dir, generatedFile));
            } catch (e) { /* ignore cleanup errors */ }

            console.error('Transcript Service Error Detail:', error);

            // Pass through specific caption error
            if (error.message.includes('This video does not have available captions')) {
                throw error;
            }

            // Handle yt-dlp specific errors
            throw new Error('Could not retrieve transcript. ' + (error.message || 'Unknown error'));
        }
    },

    /**
     * Extracts video metadata (title, thumbnail) using yt-dlp
     */
    getVideoMetadata: async (videoUrl: string): Promise<{ title: string; thumbnail: string }> => {
        const cookiesPath = getWritableCookiesPath();
        try {
            console.log(`[METADATA] Starting metadata fetch for: ${videoUrl}`);
            await ensureBinary();
            console.log(`[METADATA] Binary verified, calling yt-dlp.getVideoInfo()...`);

            const args = [
                videoUrl,
                '--dump-json',
                '--extractor-args', 'youtube:player_client=android',
                '--no-playlist'
            ];

            if (cookiesPath) {
                console.log(`[METADATA] Using cookies from: ${cookiesPath}`);
                args.push('--cookies', cookiesPath);
            }

            const output = await ytDlpWrap.execPromise(args);

            // Clean up
            if (cookiesPath && cookiesPath.includes('cookies_')) {
                try { fs.unlinkSync(cookiesPath); } catch (e) { }
            }

            const metadata = JSON.parse(output);

            console.log(`[METADATA] ✓ Metadata received. Title: "${metadata.title}"`);
            console.log(`[METADATA] ✓ Thumbnail URL: ${metadata.thumbnail ? 'Found' : 'Not found'}`);

            return {
                title: metadata.title || 'Untitled Video',
                thumbnail: metadata.thumbnail || ''
            };
        } catch (error: any) {
            // Clean up
            if (cookiesPath && cookiesPath.includes('cookies_')) {
                try { fs.unlinkSync(cookiesPath); } catch (e) { }
            }
            console.error('[METADATA] ✗ Failed to fetch metadata:', error.message);
            console.error('[METADATA] ✗ Full error:', error);
            // Fallback to URL if metadata extraction fails
            return {
                title: 'YouTube Video',
                thumbnail: ''
            };
        }
    }
};

/**
 * Simple VTT parser to extract spoken text.
 * Removes headers, timestamps, and metadata.
 */
const parseVtt = (vttData: string): string => {
    const lines = vttData.split('\n');
    const textLines: string[] = [];

    const seen = new Set<string>();

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip headers, empty lines, notes, and timestamps
        if (!trimmed ||
            trimmed.startsWith('WEBVTT') ||
            trimmed.startsWith('NOTE') ||
            trimmed.includes('-->') ||
            /^\d+$/.test(trimmed) // Skip standalone numbers (sequence IDs)
        ) {
            continue;
        }

        // Clean up tags like <c.colorCCCCCC>text</c> or <b>text</b>
        const cleanLine = trimmed.replace(/<\/?[^>]+(>|$)/g, "");

        // Remove duplicate recurring lines (common in auto-generated captions)
        if (!seen.has(cleanLine)) {
            seen.add(cleanLine);
            textLines.push(cleanLine);
        }
    }

    return textLines.join(' ');
};

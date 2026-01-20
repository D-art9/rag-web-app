import fs from 'fs';
import path from 'path';
import YtDlpWrap from 'yt-dlp-wrap';

const binaryPath = path.resolve(__dirname, '../../yt-dlp.exe');
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
 * Handles external data extraction using yt-dlp.
 */
export const transcriptService = {
    extractTranscript: async (videoUrl: string): Promise<string> => {
        const vttPath = path.resolve(__dirname, `temp_${Date.now()}.vtt`);

        try {
            console.log(`[INGEST] Starting transcript extraction for: ${videoUrl}`);
            await ensureBinary();
            console.log(`[INGEST] Binary verified, executing yt-dlp command...`);

            // Download instructions:
            // --write-auto-sub: Get auto-generated captions
            // --write-sub: Get manual captions
            // --skip-download: Don't download video
            // --sub-lang en: Prefer English
            // --output: Save to specific path
            await ytDlpWrap.execPromise([
                videoUrl,
                '--write-auto-sub',
                '--write-sub',
                '--sub-lang', 'en',
                '--skip-download',
                '--output', vttPath
            ]);

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
            // Cleanup on error if file exists
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
        try {
            console.log(`[METADATA] Starting metadata fetch for: ${videoUrl}`);
            await ensureBinary();
            console.log(`[METADATA] Binary verified, calling yt-dlp.getVideoInfo()...`);

            const metadata = await ytDlpWrap.getVideoInfo(videoUrl);

            console.log(`[METADATA] ✓ Metadata received. Title: "${metadata.title}"`);
            console.log(`[METADATA] ✓ Thumbnail URL: ${metadata.thumbnail ? 'Found' : 'Not found'}`);

            return {
                title: metadata.title || 'Untitled Video',
                thumbnail: metadata.thumbnail || ''
            };
        } catch (error: any) {
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

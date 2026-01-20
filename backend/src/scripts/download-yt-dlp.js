const fs = require('fs');
const path = require('path');
const axios = require('axios');

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
// Resolve to the root backend folder
const binaryPath = path.resolve(__dirname, '../../', binaryName);

// Use the latest release directly to ensure we have the newest fixes
// This URL redirects to the latest binary and bypasses the API rate limit check
const DOWNLOAD_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;

(async () => {
    console.log('--- YT-DLP DIRECT DOWNLOAD SCRIPT ---');
    console.log('Target Path:', binaryPath);
    console.log('Download URL:', DOWNLOAD_URL);

    try {
        // Ensure directory exists
        const dir = path.dirname(binaryPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Download directly using axios stream
        console.log('Starting direct download...');
        const response = await axios({
            method: 'get',
            url: DOWNLOAD_URL,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(binaryPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('Download successful.');

        if (!isWindows) {
            console.log('Setting permissions (chmod 755)...');
            fs.chmodSync(binaryPath, '755');
        }

        console.log('Success! Binary is ready.');
    } catch (error) {
        console.error('CRITICAL ERROR during yt-dlp download:');
        console.error(error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
        process.exit(1);
    }
})();

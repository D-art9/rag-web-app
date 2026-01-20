const fs = require('fs');
const path = require('path');
const YtDlpWrap = require('yt-dlp-wrap').default;

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
// Resolve to the root backend folder
const binaryPath = path.resolve(__dirname, '../../', binaryName);

(async () => {
    console.log('--- YT-DLP DOWNLOAD SCRIPT DEBUG ---');
    console.log('Platform:', process.platform);
    console.log('Script Directory:', __dirname);
    console.log('Target Binary Path:', binaryPath);

    // Ensure directory exists
    const dir = path.dirname(binaryPath);
    if (!fs.existsSync(dir)) {
        console.log('Directory does not exist, creating:', dir);
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        console.log('Starting download from GitHub...');
        await YtDlpWrap.downloadFromGithub(binaryPath);
        console.log('Download successful.');

        if (!isWindows) {
            console.log('Setting permissions (chmod 755)...');
            fs.chmodSync(binaryPath, '755');
        }

        console.log('Success! Binary is ready.');
    } catch (error) {
        console.error('CRITICAL ERROR during yt-dlp download:');
        console.error(error);
        if (error.code) console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Body:', error.response.data);
        }
        process.exit(1);
    }
})();

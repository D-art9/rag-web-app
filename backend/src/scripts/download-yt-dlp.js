const fs = require('fs');
const path = require('path');
const YtDlpWrap = require('yt-dlp-wrap').default;

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.resolve(__dirname, '../../', binaryName);

(async () => {
    console.log(`Downloading yt-dlp binary (${process.platform}) to:`, binaryPath);
    try {
        await YtDlpWrap.downloadFromGithub(binaryPath);

        // Ensure executable permissions on Linux/Mac
        if (!isWindows) {
            fs.chmodSync(binaryPath, '755');
        }

        console.log('Download complete and permissions set!');
    } catch (error) {
        console.error('Download failed:', error);
        process.exit(1);
    }
})();

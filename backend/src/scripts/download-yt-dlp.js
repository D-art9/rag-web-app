const fs = require('fs');
const path = require('path');
const YtDlpWrap = require('yt-dlp-wrap').default;

const binaryPath = path.resolve(__dirname, '../yt-dlp.exe');

(async () => {
    console.log('Downloading yt-dlp binary to:', binaryPath);
    try {
        await YtDlpWrap.downloadFromGithub(binaryPath);
        console.log('Download complete!');
    } catch (error) {
        console.error('Download failed:', error);
        process.exit(1);
    }
})();

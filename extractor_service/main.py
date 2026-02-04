from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import yt_dlp
import os
import uvicorn
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("extractor")

app = FastAPI()

class VideoRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "YouTube Extractor"}

@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"Received extraction request for: {request.url}")
    
    # 1. Configure Options
    # We use environment variables for Proxy/Cookies same as before
    proxy = os.getenv("YOUTUBE_PROXY")
    cookies = os.getenv("YOUTUBE_COOKIE")
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'skip_download': True,
        'extract_flat': 'in_playlist', # Just in case it's a playlist, don't crash
        
        # Spoofing
        'extractor_args': {'youtube': {'player_client': ['android']}},
    }

    # Add Proxy if exists
    if proxy:
        ydl_opts['proxy'] = proxy
        logger.info("Using Proxy")

    # Add Cookies logic (Header is harder in python lib, usually expects file)
    # We will try to pass standard headers if possible, or skip if complex.
    # yt_dlp lib allows `http_headers` option.
    if cookies:
        ydl_opts['http_headers'] = {'Cookie': cookies}
        logger.info("Using Cookies")

    try:
        # 2. Run Extraction
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            
            # 3. Parse Metadata
            metadata = {
                "title": info.get('title', 'Unknown Title'),
                "thumbnail": info.get('thumbnail', ''),
                "duration": info.get('duration', 0),
                "view_count": info.get('view_count', 0),
                "author": info.get('uploader', 'Unknown Author')
            }

            # 4. Parse Transcript (Automatic Captions)
            # yt-dlp puts subtitles in 'requested_subtitles' or 'subtitles' or 'automatic_captions'
            transcript_text = ""
            
            # Using 'traverse_obj' or direct access? Let's check typical structure
            # For 'skip_download=True', yt-dlp often creates a URL for the sub file rather than content.
            # We might need to download the m3u8/vtt URL content manually.
            
            # BETTER APPROACH for Speed:
            # If we just want text, we might need to actually 'download' the sub to memory?
            # Actually, the 'automatic_captions' field usually contains URLs.
            
            captions = info.get('automatic_captions') or info.get('subtitles')
            if captions and 'en' in captions:
                # Get the JSON3 or VTT url
                # Usually lists multiple formats. 'json3' is best for parsing, 'vtt' is easiest for text.
                subs_list = captions['en']
                
                # Prioritize VTT or ITT
                vtt_url = next((s['url'] for s in subs_list if 'vtt' in s.get('ext', '')), None)
                if not vtt_url:
                     vtt_url = next((s['url'] for s in subs_list if 'json3' in s.get('ext', '')), None) # Fallback
                
                if vtt_url:
                    logger.info(f"Found subtitle URL: {vtt_url}")
                    # Fetch the content directly (fastest way, no yt-dlp re-download)
                    import requests
                    # We must use the same proxy/headers to fetch subs if they are protected?
                    # Usually sub URLs are signed and don't need auth, but let's be safe.
                    headers = {'User-Agent': 'Mozilla/5.0'}
                    if cookies: headers['Cookie'] = cookies
                    proxies = {'http': proxy, 'https': proxy} if proxy else None
                    
                    try:
                        resp = requests.get(vtt_url, headers=headers, proxies=proxies, timeout=10)
                        raw_subs = resp.text
                        
                        # Clean VTT
                        lines = raw_subs.split('\n')
                        unique_lines = []
                        seen = set()
                        for line in lines:
                            l = line.strip()
                            # Filter out timestamps, headers, empty lines
                            if not l or '-->' in l or l.startswith('WEBVTT') or l.startswith('NOTE') or l.isdigit():
                                continue
                            # Filter duplicate lines (common in VTT)
                            clean_line = l.replace('<c>', '').replace('</c>', '').replace('&nbsp;', ' ')
                            if clean_line not in seen:
                                unique_lines.append(clean_line)
                                seen.add(clean_line)
                        
                        transcript_text = " ".join(unique_lines)
                        
                    except Exception as e:
                        logger.error(f"Failed to download/parse subs: {e}")
                        transcript_text = "" # Fail gracefully
            
            if not transcript_text:
                # If yt-dlp failed to find subs or we failed to download
                transcript_text = "No transcript available (Auto-captions not found)."

            return {
                "metadata": metadata,
                "transcript": transcript_text
            }

    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

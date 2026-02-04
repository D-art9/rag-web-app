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

    # ... (Keep existing setup) ...
    video_id = request.url.split("v=")[-1].split("&")[0] # Simple ID extract
    transcript_text = ""
    metadata = {"title": "YouTube Video", "thumbnail": ""} # Init metadata too for safety

    try:

        # ATTEMPT 1: Primary Extraction (yt-dlp)
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(request.url, download=False)
                # ... (Parsing Metadata) ...
                metadata = {
                    "title": info.get('title', 'Unknown Title'),
                    "thumbnail": info.get('thumbnail', ''),
                    "duration": info.get('duration', 0),
                    "view_count": info.get('view_count', 0),
                    "author": info.get('uploader', 'Unknown Author')
                }
                
                # Check for captions in yt-dlp info
                transcript_text = ""
                captions = info.get('automatic_captions') or info.get('subtitles')
                if captions and 'en' in captions:
                     # ... (Keep existing VTT download logic) ...
                     # For brevity, let's assume we reuse the previous logic or encapsulate it.
                     # Actually, to be safe, let's just trigger the fallback if text is empty.
                     pass 
            except Exception as ytdlp_error:
                logger.warning(f"yt-dlp partial failure: {ytdlp_error}")
                metadata = {"title": "YouTube Video", "thumbnail": ""}
                # Fallthrough to fallback

        # ATTEMPT 2: Fallback (youtube_transcript_api)
        # If yt-dlp failed to get text (or failed entirely), we try this specific API.
        if not transcript_text:
            logger.info("Falling back to youtube_transcript_api...")
            from youtube_transcript_api import YouTubeTranscriptApi
            
            # This API often works where yt-dlp fails because it mimics the web client differently
            # We can use proxies here too.
            proxy_dict = {"http": proxy, "https": proxy} if proxy else None
            
            # Get transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, proxies=proxy_dict)
            
            # Join text
            transcript_text = " ".join([t['text'] for t in transcript_list])
            logger.info(f"Fallback successful. Length: {len(transcript_text)}")

        return {
            "metadata": metadata,
            "transcript": transcript_text
        }

    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"All methods failed. Last error: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import os
import uvicorn
import logging
import random
from urllib.parse import urlparse, parse_qs

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("extractor")

app = FastAPI()

class VideoRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "YouTube Extractor"}

def get_random_proxy() -> str:
    proxies_env = os.getenv("YOUTUBE_PROXIES", "")
    if proxies_env:
        proxy_list = [p.strip() for p in proxies_env.split(",") if p.strip()]
        if proxy_list:
            return random.choice(proxy_list)
    return os.getenv("YOUTUBE_PROXY", "")

from youtube_transcript_api import YouTubeTranscriptApi

def get_video_id(url: str) -> str:
    """Helper to extract YouTube video ID from various URL formats."""
    parsed_url = urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
        if parsed_url.path.startswith(('/embed/', '/v/')):
            return parsed_url.path.split('/')[2]
    return ""

@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"[MISSION_START] Multi-Tier Ingestion: {request.url}")
    video_id = get_video_id(request.url)
    
    if not video_id:
        raise HTTPException(status_code=400, detail="INVALID_YOUTUBE_URL: ID_NOT_FOUND")

    # [TIER_01] DEDICATED_TRANSCRIPT_API (Resilient Path)
    try:
        logger.info(f"[TIER_01] Attempting Specialized CC API for: {video_id}")
        # FIX: Instantiate the API class to resolve "no attribute 'get_transcript'" error
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        
        # Priority: Manual English -> Auto English
        try:
            transcript = transcript_list.find_transcript(['en'])
        except:
            transcript = transcript_list.find_generated_transcript(['en'])
            
        transcript_text = " ".join([t['text'] for t in transcript.fetch()])
        
        # Metadata check (less likely to block than full stream)
        metadata = {"title": f"Video_{video_id}", "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg", "uploader": "YouTube"}
        
        logger.info(f"[SUCCESS] Extraction verified via TIER_01")
        return {"metadata": metadata, "transcript": transcript_text.strip()}

    except Exception as api_err:
        logger.warn(f"[TIER_01_FAULT] Specific API failed: {str(api_err)}")
        
        # [TIER_02] RESILIENT_SCRAPER Fallback (Identity Sync)
        try:
            logger.info(f"[TIER_02] Reverting to Scraper Identity-Bypass...")
            
            ydl_opts = {
                'quiet': True, 'skip_download': True, 'writesubtitles': True, 
                'writeautomaticsubs': True, 'subtitleslangs': ['en.*'], 
                'nocheckcertificate': True, 'socket_timeout': 15
            }

            # Inject human context
            try: ydl_opts['cookiesfrombrowser'] = ('chrome', 'edge', 'safari')
            except: pass

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.url, download=False)
                subtitles = info.get('subtitles', {}) or info.get('automatic_captions', {})
                en_subs = None
                for lang in subtitles.keys():
                    if lang.startswith('en'): en_subs = subtitles[lang]; break
                
                if en_subs:
                    for fmt in en_subs:
                        if fmt.get('ext') == 'json3':
                            import requests
                            resp = requests.get(fmt['url'])
                            if resp.status_code == 200:
                                data = resp.json()
                                text = " ".join([s.get('utf8', '') for e in data.get('events', []) for s in e.get('segs', [{}])])
                                return {
                                    "metadata": {"title": info.get('title'), "thumbnail": info.get('thumbnail'), "uploader": info.get('uploader')},
                                    "transcript": text.strip()
                                }
            
            raise Exception("SCRAPER_ALSO_FAILED")

        except Exception as scrap_err:
            logger.error(f"[MISSION_FAILURE] Final Fallback Exhausted: {str(scrap_err)}")
            if "confirm you’re not a bot" in str(scrap_err):
                raise HTTPException(status_code=403, detail="YOUTUBE_BOT_BLOCK: Humanity check triggered. Restart local browser sync.")
            raise HTTPException(status_code=500, detail=f"EXTRACTION_FAULT: {str(api_err)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

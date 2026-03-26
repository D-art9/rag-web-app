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

@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"Extracting all via yt-dlp: {request.url}")
    try:
        proxy = get_random_proxy()
        cookies = os.getenv("YOUTUBE_COOKIE")

        # 1. yt-dlp Options
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsubs': True,
            'subtitleslangs': ['en.*'],
            'nocheckcertificate': True,
            'outtmpl': '/tmp/%(id)s.%(ext)s', # Don't actually save, but needed for sub processing
        }

        if proxy:
            ydl_opts['proxy'] = proxy
        if cookies:
            ydl_opts['http_headers'] = {'Cookie': cookies}

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get Metadata
            info = ydl.extract_info(request.url, download=False)
            
            # Fetch Transcript URL
            # yt-dlp provides subtitles as URLs. We'll fetch the first English one.
            subtitles = info.get('subtitles', {}) or info.get('automatic_captions', {})
            
            transcript_text = ""
            
            # Look for English (manual or auto)
            en_subs = None
            for lang in subtitles.keys():
                if lang.startswith('en'):
                    en_subs = subtitles[lang]
                    break
            
            if en_subs:
                # Get the JSON/VTT format URL
                for format_item in en_subs:
                    if format_item.get('ext') == 'json3': # JSON is easiest to parse
                        import requests
                        resp = requests.get(format_item['url'])
                        if resp.status_code == 200:
                            data = resp.json()
                            # Parse out the plain text from YouTube's JSON3 format
                            transcript_text = " ".join([
                                event.get('segs', [{}])[0].get('utf8', '')
                                for event in data.get('events', [])
                                if 'segs' in event
                            ])
                        break
            
            if not transcript_text:
                raise Exception("No English transcript found for this video via yt-dlp.")

            metadata = {
                "title": info.get('title', 'Unknown'),
                "thumbnail": info.get('thumbnail', ''),
                "uploader": info.get('uploader', 'Unknown'),
            }

            return {"metadata": metadata, "transcript": transcript_text.strip()}

    except Exception as e:
        logger.error(f"yt-dlp Error: {str(e)}")
        if "429" in str(e):
            raise HTTPException(status_code=429, detail="Rate limited by YouTube")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

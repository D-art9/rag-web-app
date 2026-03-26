from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import os
import uvicorn
import logging
import random
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("extractor")

app = FastAPI()

class VideoRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "YouTube Extractor"}


def parse_video_id(url: str) -> str:
    """Robustly parse the YouTube video ID from all URL formats."""
    parsed = urlparse(url)
    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        return parsed.path.lstrip("/").split("?")[0]
    path_parts = parsed.path.strip("/").split("/")
    if len(path_parts) >= 2 and path_parts[0] in ("shorts", "embed", "v"):
        return path_parts[1]
    qs = parse_qs(parsed.query)
    if "v" in qs and qs["v"]:
        return qs["v"][0]
    raise ValueError(f"Could not parse YouTube video ID from URL: {url}")


def get_random_proxy() -> str:
    """
    FIX: Picks a random proxy from YOUTUBE_PROXIES (comma-separated list).
    Falls back to YOUTUBE_PROXY if plural is not set.
    """
    proxies_env = os.getenv("YOUTUBE_PROXIES", "")
    if proxies_env:
        proxy_list = [p.strip() for p in proxies_env.split(",") if p.strip()]
        if proxy_list:
            chosen = random.choice(proxy_list)
            logger.info(f"Using rotated proxy: {chosen.split('@')[-1]}") # Log host:port only for privacy
            return chosen
    
    single_proxy = os.getenv("YOUTUBE_PROXY")
    if single_proxy:
        return single_proxy
    
    return ""


@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"Received extraction request for: {request.url}")

    video_id = parse_video_id(request.url)
    proxy = get_random_proxy()
    cookies = os.getenv("YOUTUBE_COOKIE")

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'extractor_args': {'youtube': {'player_client': ['android']}},
    }

    if proxy:
        ydl_opts['proxy'] = proxy
    if cookies:
        ydl_opts['http_headers'] = {'Cookie': cookies}

    transcript_text = ""
    metadata = {"title": "YouTube Video", "thumbnail": ""}
    errors = []

    try:
        # ATTEMPT 1: Get metadata via yt-dlp
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.url, download=False)
                metadata = {
                    "title": info.get('title', 'Unknown Title'),
                    "thumbnail": info.get('thumbnail', ''),
                    "duration": info.get('duration', 0),
                    "uploader": info.get('uploader', 'Unknown Author')
                }
                logger.info(f"yt-dlp metadata OK")
        except Exception as ytdlp_error:
            errors.append(f"yt-dlp: {str(ytdlp_error)}")

        # ATTEMPT 2: Get transcript via youtube_transcript_api
        proxy_dict = {"http": proxy, "https": proxy} if proxy else None
        
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, proxies=proxy_dict)
            try:
                transcript = transcript_list.find_transcript(['en'])
            except:
                transcript = transcript_list.find_generated_transcript(['en'])
            
            t_data = transcript.fetch()
            transcript_text = " ".join([t['text'] for t in t_data])
            logger.info(f"Transcript fetched OK ({len(transcript_text)} chars)")
        except Exception as e:
            errors.append(f"transcript_api: {str(e)}")

        if not transcript_text:
            error_summary = " | ".join(errors)
            # Check for YouTube rate limits specifically
            if "Too Many Requests" in error_summary or "429" in error_summary:
                raise HTTPException(status_code=429, detail="YouTube is rate-limiting this request (429).")
            raise Exception(f"No transcript found. Errors: {error_summary}")

        return {"metadata": metadata, "transcript": transcript_text}

    except HTTPException as h_err:
        raise h_err
    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

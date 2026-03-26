from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import os
import uvicorn
import logging
import random
from urllib.parse import urlparse, parse_qs
import youtube_transcript_api # Import the entire core module first

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
    return ""

def get_random_proxy() -> str:
    """Rotates through the YOUTUBE_PROXIES pool."""
    proxies_env = os.getenv("YOUTUBE_PROXIES", "")
    if proxies_env:
        proxy_list = [p.strip() for p in proxies_env.split(",") if p.strip()]
        if proxy_list:
            return random.choice(proxy_list)
    return os.getenv("YOUTUBE_PROXY", "")

@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"Extracting: {request.url}")
    try:
        video_id = parse_video_id(request.url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")

        proxy = get_random_proxy()
        cookies = os.getenv("YOUTUBE_COOKIE")
        proxy_dict = {"http": proxy, "https": proxy} if proxy else None

        # 1. Metadata via yt-dlp
        metadata = {"title": "YouTube Video", "thumbnail": ""}
        try:
            ydl_opts = {'quiet': True, 'skip_download': True}
            if proxy:
                ydl_opts['proxy'] = proxy
            if cookies:
                ydl_opts['http_headers'] = {'Cookie': cookies}

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.url, download=False)
                metadata = {
                    "title": info.get('title', 'Unknown Title'),
                    "thumbnail": info.get('thumbnail', ''),
                    "duration": info.get('duration', 0),
                    "uploader": info.get('uploader', 'Unknown Author')
                }
                logger.info("yt-dlp metadata OK")
        except:
            logger.warning("yt-dlp metadata failed, using defaults")

        # 2. Transcript via absolute module call (Bypasses any naming conflicts)
        transcript_text = ""
        try:
            # We call the module's helper class specifically
            t_data = youtube_transcript_api.YouTubeTranscriptApi.get_transcript(video_id, proxies=proxy_dict)
            transcript_text = " ".join([t['text'] for t in t_data])
            logger.info("Success: get_transcript")
        except Exception as e:
            logger.warning(f"get_transcript failed: {str(e)}")
            try:
                # Fallback to the other static helper
                t_list = youtube_transcript_api.YouTubeTranscriptApi.list_transcripts(video_id, proxies=proxy_dict)
                transcript = t_list.find_transcript(['en'])
                t_data = transcript.fetch()
                transcript_text = " ".join([t['text'] for t in t_data])
                logger.info("Success: list_transcripts")
            except Exception as e2:
                logger.error(f"Everything failed: {str(e2)}")
                # Classification of error
                err_str = str(e2)
                if "429" in err_str or "Too Many Requests" in err_str or "Sign in" in err_str:
                    raise HTTPException(status_code=429, detail="YouTube Rate Limit (429) or Bot Detected.")
                
                raise Exception(f"Failed to find transcript. Errors: {str(e)} | {err_str}")

        return {"metadata": metadata, "transcript": transcript_text}

    except HTTPException as h_err:
        raise h_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

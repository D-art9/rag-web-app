from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import yt_dlp
import os
import uvicorn
import logging
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

@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"Received extraction request for: {request.url}")
    
    # 1. Configure Options
    proxy = os.getenv("YOUTUBE_PROXY")
    cookies = os.getenv("YOUTUBE_COOKIE")
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'skip_download': True,
        'extract_flat': 'in_playlist',
        'extractor_args': {'youtube': {'player_client': ['android']}},
    }

    if proxy:
        ydl_opts['proxy'] = proxy

    if cookies:
        ydl_opts['http_headers'] = {'Cookie': cookies}

    video_id = request.url.split("v=")[-1].split("&")[0]
    transcript_text = ""
    metadata = {"title": "YouTube Video", "thumbnail": ""}

    # ... setup ...
    errors = []

    try:
        # ATTEMPT 1: Primary Extraction (yt-dlp)
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.url, download=False)
                
                metadata = {
                    "title": info.get('title', 'Unknown Title'),
                    "thumbnail": info.get('thumbnail', ''),
                    "duration": info.get('duration', 0),
                    "view_count": info.get('view_count', 0),
                    "author": info.get('uploader', 'Unknown Author')
                }
                
                captions = info.get('automatic_captions') or info.get('subtitles')
                if captions and 'en' in captions:
                    pass 
                
        except Exception as ytdlp_error:
            err_str = str(ytdlp_error)
            logger.warning(f"yt-dlp partial failure: {err_str}")
            errors.append(f"yt-dlp: {err_str}")

        # ATTEMPT 2: Fallback (youtube_transcript_api)
        if not transcript_text:
            logger.info("Falling back to youtube_transcript_api...")
            
            proxy_dict = {"http": proxy, "https": proxy} if proxy else None
            
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, proxies=proxy_dict)
                try:
                    transcript = transcript_list.find_transcript(['en'])
                except:
                    transcript = transcript_list.find_generated_transcript(['en'])
                
                t_data = transcript.fetch()
                transcript_text = " ".join([t['text'] for t in t_data])
                logger.info(f"Fallback successful. Length: {len(transcript_text)}")
                
            except Exception as trans_error:
                err_str = str(trans_error)
                logger.error(f"Fallback API also failed: {err_str}")
                errors.append(f"Fallback 1: {err_str}")
                
                # Last resort: Static method
                try:
                    t_data = YouTubeTranscriptApi.get_transcript(video_id, proxies=proxy_dict)
                    transcript_text = " ".join([t['text'] for t in t_data])
                except Exception as e2:
                     logger.error(f"Static fallback failed: {e2}")
                     errors.append(f"Fallback 2: {str(e2)}")

        if not transcript_text:
             error_summary = " | ".join(errors)
             raise Exception(f"No transcript found. Errors: {error_summary}")

        return {
            "metadata": metadata,
            "transcript": transcript_text
        }

    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        # Return the DETAILED errors to the user
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

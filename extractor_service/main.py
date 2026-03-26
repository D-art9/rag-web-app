from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import os
import uvicorn
import logging
from urllib.parse import urlparse, parse_qs
import youtube_transcript_api
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
    """
    FIX: Robustly parse the YouTube video ID from all URL formats:
      - https://www.youtube.com/watch?v=VIDEO_ID
      - https://youtu.be/VIDEO_ID
      - https://www.youtube.com/shorts/VIDEO_ID
      - https://www.youtube.com/embed/VIDEO_ID
    """
    parsed = urlparse(url)

    # youtu.be short links
    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        return parsed.path.lstrip("/").split("?")[0]

    # /shorts/ and /embed/ paths
    path_parts = parsed.path.strip("/").split("/")
    if len(path_parts) >= 2 and path_parts[0] in ("shorts", "embed", "v"):
        return path_parts[1]

    # Standard ?v= parameter
    qs = parse_qs(parsed.query)
    if "v" in qs and qs["v"]:
        return qs["v"][0]

    raise ValueError(f"Could not parse YouTube video ID from URL: {url}")


@app.post("/extract")
async def extract_video(request: VideoRequest):
    logger.info(f"Received extraction request for: {request.url}")

    video_id = parse_video_id(request.url)
    logger.info(f"Parsed Video ID: {video_id}")

    proxy = os.getenv("YOUTUBE_PROXY")
    cookies = os.getenv("YOUTUBE_COOKIE")

    # FIX: Removed 'extract_flat': 'in_playlist' — this prevents yt-dlp from
    # returning full metadata (title, thumbnail) for single videos.
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
                    "view_count": info.get('view_count', 0),
                    "author": info.get('uploader', 'Unknown Author')
                }
                logger.info(f"yt-dlp metadata OK: title='{metadata['title']}'")
        except Exception as ytdlp_error:
            err_str = str(ytdlp_error)
            logger.warning(f"yt-dlp metadata fetch failed: {err_str}")
            errors.append(f"yt-dlp: {err_str}")

        # ATTEMPT 2: Get transcript via youtube_transcript_api (primary)
        if not transcript_text:
            logger.info("Fetching transcript via youtube_transcript_api...")
            proxy_dict = {"http": proxy, "https": proxy} if proxy else None

            # Strategy 1: Static list_transcripts
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, proxies=proxy_dict)
                try:
                    transcript = transcript_list.find_transcript(['en'])
                except Exception:
                    transcript = transcript_list.find_generated_transcript(['en'])
                t_data = transcript.fetch()
                transcript_text = " ".join([t['text'] for t in t_data])
                logger.info(f"Strategy 1 succeeded: {len(transcript_text)} chars")
            except Exception as e1:
                errors.append(f"list_transcripts: {e1}")

                # Strategy 2: Static get_transcript (legacy)
                try:
                    t_data = YouTubeTranscriptApi.get_transcript(video_id, proxies=proxy_dict)
                    transcript_text = " ".join([t['text'] for t in t_data])
                    logger.info(f"Strategy 2 succeeded: {len(transcript_text)} chars")
                except Exception as e2:
                    errors.append(f"get_transcript: {e2}")

                    # Strategy 3: Instance-based API
                    try:
                        ytt = YouTubeTranscriptApi()
                        lister = ytt.list(video_id) if hasattr(ytt, 'list') else ytt.list_transcripts(video_id)
                        try:
                            t = lister.find_transcript(['en'])
                        except Exception:
                            t = lister.find_generated_transcript(['en'])
                        t_data = t.fetch()
                        transcript_text = " ".join([t['text'] for t in t_data])
                        logger.info(f"Strategy 3 succeeded: {len(transcript_text)} chars")
                    except Exception as e3:
                        errors.append(f"instance list: {e3}")

        if not transcript_text:
            error_summary = " | ".join(errors)
            raise Exception(f"No transcript found. All strategies failed: {error_summary}")

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

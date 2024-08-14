import datetime
from django.core.cache import cache
from .youtube_api import get_latest_videos

def update_latest_videos():
    channel_id = "YOUR_CHANNEL_ID"
    latest_videos = get_latest_videos(channel_id)
    if latest_videos:
        cache.set("latest_videos", latest_videos, timeout=24*60*60)  # 24時間キャッシュ

def get_cached_latest_videos():
    latest_videos = cache.get("latest_videos")
    if not latest_videos:
        update_latest_videos()
        latest_videos = cache.get("latest_videos")
    return latest_videos

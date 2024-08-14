import datetime
from django.core.cache import cache
from .youtube_api import get_channel_info

def update_channel_info():
    channel_id = "YOUR_CHANNEL_ID"
    channel_info = get_channel_info(channel_id)
    if channel_info:
        cache.set("channel_info", channel_info, timeout=30*24*60*60)  # 30日間キャッシュ

def get_cached_channel_info():
    channel_info = cache.get("channel_info")
    if not channel_info:
        update_channel_info()
        channel_info = cache.get("channel_info")
    return channel_info

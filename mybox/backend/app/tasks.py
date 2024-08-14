# app/tasks.py
from celery import shared_task
from .youtube_api import get_channel_info, get_latest_videos
from django.core.cache import cache

@shared_task
def scheduled_update_channel_info():
    channel_id = "YOUR_CHANNEL_ID"
    channel_info = get_channel_info(channel_id)
    if channel_info:
        cache.set('channel_info', channel_info, timeout=30*24*60*60)  # 30日間キャッシュ

@shared_task
def scheduled_update_latest_videos():
    channel_id = "YOUR_CHANNEL_ID"
    latest_videos = get_latest_videos(channel_id)
    if latest_videos:
        cache.set('latest_videos', latest_videos, timeout=24*60*60)  # 1日間キャッシュ

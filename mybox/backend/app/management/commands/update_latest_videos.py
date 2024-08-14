import datetime
import os
from django.core.management.base import BaseCommand
from django.core.cache import cache
from app.youtube_api import get_latest_videos

class Command(BaseCommand):
    help = 'YouTubeの最新動画を更新します'

    def handle(self, *args, **kwargs):
        channel_id = os.getenv('YOUTUBE_CHANNEL_ID')
        
        if not channel_id:
            self.stdout.write(self.style.ERROR('チャンネルIDが設定されていません'))
            return

        # 最新動画を一日に一回更新
        last_videos_update = cache.get('last_videos_update')
        if not last_videos_update or (datetime.datetime.now() - last_videos_update).days >= 1:
            latest_videos = get_latest_videos(channel_id)
            if latest_videos:
                cache.set('latest_videos', latest_videos, timeout=24*60*60)  # 1日間キャッシュ
                cache.set('last_videos_update', datetime.datetime.now())
                self.stdout.write(self.style.SUCCESS('最新動画を正常に更新しました'))
            else:
                self.stdout.write(self.style.ERROR('最新動画の取得に失敗しました'))

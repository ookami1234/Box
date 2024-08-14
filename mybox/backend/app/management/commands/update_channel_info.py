import datetime
import os
from django.core.management.base import BaseCommand
from django.core.cache import cache
from app.youtube_api import get_channel_info

class Command(BaseCommand):
    help = 'YouTubeのチャンネル情報を更新します'

    def handle(self, *args, **kwargs):
        channel_id = os.getenv('YOUTUBE_CHANNEL_ID')
        
        if not channel_id:
            self.stdout.write(self.style.ERROR('チャンネルIDが設定されていません'))
            return
        
        # チャンネル情報を月に一回更新
        last_channel_update = cache.get('last_channel_update')
        if not last_channel_update or (datetime.datetime.now() - last_channel_update).days >= 30:
            channel_info = get_channel_info(channel_id)
            if channel_info:
                cache.set('channel_info', channel_info, timeout=30*24*60*60)  # 30日間キャッシュ
                cache.set('last_channel_update', datetime.datetime.now())
                self.stdout.write(self.style.SUCCESS('チャンネル情報を正常に更新しました'))
            else:
                self.stdout.write(self.style.ERROR('チャンネル情報の取得に失敗しました'))

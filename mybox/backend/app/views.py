from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ModelViewSet
from .models import Post
from .serializers import PostSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from django.core.cache import cache
from app.youtube_api import get_channel_info, get_latest_videos

# 投稿一覧を提供するAPIビュー
class PostListView(ListAPIView):
    queryset = Post.objects.all().order_by("-updated_at")
    serializer_class = PostSerializer
    permission_classes = (AllowAny,)

# 特定の投稿の詳細を提供するAPIビュー
class PostDetailView(RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (AllowAny,)
    lookup_field = "uid"

# 新規投稿、投稿編集、投稿削除を行うAPIビューセット
class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = "uid"

    def perform_create(self, serializer, **kwargs):
        channel_id = self.request.data.get('channelId')
        latest_videos = None
        if channel_id:
            print(f"Fetching latest videos for channel_id: {channel_id}")  # ログ出力
            latest_videos = get_latest_videos(channel_id)
            print(f"Latest videos response: {latest_videos}")  # ログ出力
            if not latest_videos['success']:
                print(f"Error fetching latest videos: {latest_videos['error']}")  # ログ出力
                serializer.save(user=self.request.user, channelId=channel_id, latest_videos=None)
                return
        serializer.save(user=self.request.user, channelId=channel_id, latest_videos=latest_videos)

# YouTubeのチャンネル情報を取得するAPIビュー
class ChannelInfoView(APIView):
    def get(self, request, channel_id):
        channel_info = cache.get('channel_info')
        if not channel_info:
            return JsonResponse({'error': 'チャンネル情報がキャッシュされていません'}, status=404)
        return JsonResponse(channel_info)

# YouTubeの最新動画を取得するAPIビュー
class LatestVideo(APIView):
    def get(self, request):
        latest_videos = cache.get('latest_videos')
        if not latest_videos:
            return JsonResponse({'error': '最新動画がキャッシュされていません'}, status=404)
        return JsonResponse({'videos': latest_videos})

# 通常のビュー関数としてのチャンネル情報取得
def get_channel_data(request, channel_id):
    channel_info = cache.get('channel_info')
    if not channel_info:
        channel_info = get_channel_info(channel_id)
        if channel_info['success']:
            cache.set('channel_info', channel_info, timeout=30*24*60*60)  # 30日間キャッシュ
        else:
            return JsonResponse(channel_info, status=400)
    return JsonResponse(channel_info)

# 通常のビュー関数としての最新動画取得
def get_latest_videos_data(request, channel_id):
    latest_videos = cache.get('latest_videos')
    if not latest_videos:
        latest_videos = get_latest_videos(channel_id)
        if latest_videos['success']:
            cache.set('latest_videos', latest_videos, timeout=24*60*60)  # 1日間キャッシュ
        else:
            return JsonResponse(latest_videos, status=400)
    return JsonResponse({'latest_videos': latest_videos})

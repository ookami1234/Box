from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostListView, PostDetailView, PostViewSet,
    ChannelInfoView, LatestVideo,
    get_channel_data, get_latest_videos_data
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('post-list/', PostListView.as_view(), name='post-list'),  # カスタムエンドポイント
    path('posts/<str:uid>/', PostDetailView.as_view(), name='post-detail'),  # UIDを使った詳細ビュー
    path('channel-info/<str:channel_id>/', ChannelInfoView.as_view(), name='channel-info'),
    path('latest-videos/', LatestVideo.as_view(), name='latest-videos'),
    path('get-channel-data/<str:channel_id>/', get_channel_data, name='get-channel-data'),
    path('get-latest-videos-data/<str:channel_id>/', get_latest_videos_data, name='get-latest-videos-data'),
]

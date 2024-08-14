import base64
from rest_framework import serializers
from django.core.files.base import ContentFile
from googleapiclient.discovery import build
from django.conf import settings

# Base64エンコードされた画像データを処理
class Base64ImageField(serializers.ImageField):
    # 入力データをPythonデータタイプに変換
    def to_internal_value(self, data):
        # Base64でエンコードされた画像データを処理
        if isinstance(data, str) and data.startswith("data:image"):
            # Base64データを取り出す
            format, imgstr = data.split(";base64,")
            # 画像の拡張子を取得
            ext = format.split("/")[-1]
            # Base64エンコードされた画像データをデコードし、ContentFileオブジェクトを作成
            data = ContentFile(base64.b64decode(imgstr), name="temp." + ext)

        # 継承されたImageFieldのto_internal_valueメソッドを呼び出し、処理済みのデータを渡す
        return super(Base64ImageField, self).to_internal_value(data)

# YouTube Data APIを使用してチャンネル情報を取得
def get_channel_info(channel_id):
    api_key = settings.YOUTUBE_API_KEY
    youtube = build('youtube', 'v3', developerKey=api_key)

    # チャンネル情報の取得
    channel_request = youtube.channels().list(
        part='snippet,statistics,contentDetails',
        id=channel_id
    )
    channel_response = channel_request.execute()
    if not channel_response['items']:
        return None

    channel_info = channel_response['items'][0]
    channel_name = channel_info['snippet']['title']
    subscriber_count = channel_info['statistics']['subscriberCount']

    # 最新動画の取得
    playlist_id = channel_info['contentDetails']['relatedPlaylists']['uploads']
    playlist_request = youtube.playlistItems().list(
        part='snippet',
        playlistId=playlist_id,
        maxResults=3
    )
    playlist_response = playlist_request.execute()
    latest_videos = []
    for item in playlist_response['items']:
        video_id = item['snippet']['resourceId']['videoId']
        title = item['snippet']['title']
        description = item['snippet']['description']
        latest_videos.append({
            'video_id': video_id,
            'title': title,
            'description': description
        })

    return {
        'channel_name': channel_name,
        'subscriber_count': subscriber_count,
        'latest_videos': latest_videos
    }

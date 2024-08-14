# serializers.py

from rest_framework import serializers
from accounts.serializers import UserSerializer
from app.models import Post

class PostSerializer(serializers.ModelSerializer):
    uid = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    image = serializers.URLField(required=False, allow_null=True)
    channelId = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    latest_videos = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = "__all__"

    def create(self, validated_data):
        latest_videos = validated_data.pop('latest_videos', None)
        post = Post.objects.create(**validated_data)
        if latest_videos is not None:
            post.latest_videos = latest_videos
            post.save(update_fields=['latest_videos'])
        return post

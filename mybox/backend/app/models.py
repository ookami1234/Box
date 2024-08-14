# models.py
from django.conf import settings
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
import uuid

# 投稿モデル
class Post(models.Model):
    uid = models.CharField("uid", max_length=36, unique=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, verbose_name="ユーザー", on_delete=models.CASCADE
    )
    image = models.URLField("サムネイル", max_length=200, null=True, blank=True)
    title = models.CharField("タイトル", max_length=255)
    content = models.TextField("内容")
    channelId = models.CharField("チャンネルID", max_length=255, null=True, blank=True)
    latest_videos = models.JSONField("最新動画", null=True, blank=True)
    updated_at = models.DateTimeField("更新日", auto_now=True)
    created_at = models.DateTimeField("作成日", auto_now_add=True)

    class Meta:
        verbose_name = "投稿"
        verbose_name_plural = "投稿"

    def __str__(self):
        return self.title

@receiver(pre_save, sender=Post)
def set_unique_uid(sender, instance, **kwargs):
    if not instance.uid:
        instance.uid = str(uuid.uuid4())

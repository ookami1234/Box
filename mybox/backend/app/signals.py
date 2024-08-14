
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post
import requests

@receiver(post_save, sender=Post)
def fetch_youtube_thumbnail(sender, instance, created, **kwargs):
    if created and instance.channelId:
        api_key = "YOUR_YOUTUBE_API_KEY"
        url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&id={instance.channelId}&key={api_key}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data["items"]:
                thumbnail_url = data["items"][0]["snippet"]["thumbnails"]["high"]["url"]
                instance.image = thumbnail_url
                instance.save()

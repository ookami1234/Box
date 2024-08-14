# app/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# プロジェクトの設定モジュールを環境変数として設定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

app = Celery('app')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

app = Celery("project")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# community tasks
app.conf.beat_schedule = {
    "daily_market_expiration_and_unban": {
        "task": "community.tasks.daily_status_update",
        "schedule": crontab(hour=0, minute=0),  # every day at midnight
    },
}


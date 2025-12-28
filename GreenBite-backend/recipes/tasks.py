from celery import shared_task
import time

@shared_task(bind=True)
def test_task(self):
    time.sleep(3)
    return "Celery is working 🚀"

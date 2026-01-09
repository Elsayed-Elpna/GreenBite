import base64
import json
import os
from celery import shared_task
from PIL import Image
from io import BytesIO
from django.conf import settings
from django.db import transaction
from openai import OpenAI

from .models import FoodSafetyScanJob
from food.utils.minio_s3 import s3_client, SPOILAGE_SCHEMA

client = OpenAI()

MAX_DIM = 1280          # resize
JPEG_QUALITY = 82  
OUTPUT_CT = "image/jpeg"

# i replaced the path with key in the s3 bucket and its bucket 
def _make_data_url_from_minio(bucket: str, key: str) -> str:
    s3 = s3_client()
    obj = s3.get_object(
        Bucket=bucket,
        Key=key
    )
    raw = obj["Body"].read()

    with Image.open(BytesIO(raw)) as im:
        im = im.convert("RGB")
        im.thumbnail((MAX_DIM, MAX_DIM))

        buf = BytesIO()
        im.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        data = buf.getvalue()

    b64 = base64.b64encode(data).decode("utf-8")
    return f"data:{OUTPUT_CT};base64,{b64}"


@shared_task(bind=True, max_retries=2, default_retry_delay=15)
def process_food_safety_scan(self, job_id: int):
    job = FoodSafetyScanJob.objects.get(id=job_id)
    # mark running
    FoodSafetyScanJob.objects.filter(id=job_id).update(status=FoodSafetyScanJob.STATUS_RUNNING)
    bucket = settings.S3_BUCKET_FOOD_SCANS
    key = job.image_key
    try:
        if not key:
            raise ValueError("No image key found for the job.")

        data_url = _make_data_url_from_minio(bucket, key)

        user_context = (
            f"food_name={job.food_name}, storage={job.storage}, "
            f"opened_days={job.opened_days}, notes={job.notes}"
        ).strip(", ")

        response = client.responses.create(
            model="gpt-4.1-mini",
            store=False,
            instructions=(
                "You are a food safety assistant. You ONLY judge based on visible signs in the photo + user context. "
                "Be conservative: if uncertain, verdict must be 'unsure' and advise discarding or following label guidance. "
                "Never claim lab-level certainty or detect invisible bacteria/toxins."
            ),
            input=[{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": f"Decide if this food is spoiled. Context: {user_context}"},
                    {"type": "input_image", "image_url": data_url, "detail": "high"},
                ],
            }],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "food_spoilage_scan",
                    "strict": True,
                    "schema": SPOILAGE_SCHEMA,
                }
            },
        )

        raw = (response.output_text or "").strip()
        parsed = json.loads(raw)
        FoodSafetyScanJob.objects.filter(id=job_id).update(
            status=FoodSafetyScanJob.STATUS_SUCCESS,
            result=parsed,
            error="",
        )
        s3 = s3_client()
        s3.delete_object(Bucket=bucket, Key=key)
        FoodSafetyScanJob.objects.filter(id=job_id).update(image_key="")
        return parsed

    except Exception as e:
        FoodSafetyScanJob.objects.filter(id=job_id).update(
            status=FoodSafetyScanJob.STATUS_FAILED,
            error=str(e),
        )
        raise

    finally:
        # discard the file
        try:
            if key:
                s3 = s3_client()
                s3.delete_object(Bucket=bucket, Key=key)
                FoodSafetyScanJob.objects.filter(id=job_id).update(image_key="")
        except Exception:
            pass
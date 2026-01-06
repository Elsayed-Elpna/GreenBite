import base64
import json
import tempfile
import os
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import uuid
from food.models import FoodSafetyScanJob
from food.tasks import process_food_safety_scan
from food.utils.minio_s3 import s3_client, ensure_bucket, put_expire_lifecycle_rule
from django.conf import settings
from openai import OpenAI
client = OpenAI()

ALLOWED_CT = {"image/jpeg", "image/png", "image/webp"}

SPOILAGE_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {"type": "string", "enum": ["good", "likely_spoiled", "unsure"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "visible_signs": {"type": "array", "items": {"type": "string"}},
        "reasoning_summary": {"type": "string"},
        "safe_next_steps": {"type": "array", "items": {"type": "string"}},
        "warning": {"type": "string"},
    },
    "required": [
        "verdict",
        "confidence",
        "visible_signs",
        "reasoning_summary",
        "safe_next_steps",
        "warning",
    ],
    "additionalProperties": False,
}

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def food_safety_scan(request):
    img = request.FILES.get("image")
    if not img:
        return Response({"detail":"image is required"}, status = status.HTTP_400_BAD_REQUEST)
    
    if img.content_type not in ALLOWED_CT:
        return Response({
            "detail": f"Unsupported content type: {img.content_type}"
        }, status= status.HTTP_400_BAD_REQUEST)
    ensure_bucket(settings.S3_BUCKET_FOOD_SCANS)
    try:
        put_expire_lifecycle_rule(
            settings.S3_BUCKET_FOOD_SCANS,
            prefix="foodscan/",
            days=1,
        )
    except Exception as e:
        pass  
    key = f"foodscan/{request.user.id}/{uuid.uuid4().hex}"
    s3 = s3_client()
    s3.upload_fileobj(
        Fileobj=img.file,  
        Bucket=settings.S3_BUCKET_FOOD_SCANS,
        Key=key,
        ExtraArgs={"ContentType": img.content_type},
    )

    job = FoodSafetyScanJob.objects.create(
        user=request.user,
        status=FoodSafetyScanJob.STATUS_PENDING,
        image_key=key,
        image_path="",
        food_name=(request.data.get("food_name") or "").strip(),
        storage=(request.data.get("storage") or "").strip(),
        opened_days=(request.data.get("opened_days") or "").strip(),
        notes=(request.data.get("notes") or "").strip(),
    )
    task = process_food_safety_scan.delay(job.id)
    return Response(
        {
            "status": "queued",
            "job_id": job.id,
            "task_id": task.id,
        },
        status=status.HTTP_202_ACCEPTED,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def food_safety_scan_status(request, job_id: int):
    try:
        job = FoodSafetyScanJob.objects.get(id=job_id, user=request.user)
    except FoodSafetyScanJob.DoesNotExist:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        {
            "job_id": job.id,
            "status": job.status,
            "result": job.result,
            "error": job.error or None,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
        },
        status=status.HTTP_200_OK,
    )
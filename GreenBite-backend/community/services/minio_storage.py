import mimetypes
import os
import uuid
from dataclasses import dataclass

import boto3
from django.conf import settings
from botocore.exceptions import ClientError



@dataclass
class UploadedObject:
    key: str
    bucket: str
    content_type: str


def _s3_client(endpoint_url: str):
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        region_name=getattr(settings, "S3_REGION", "us-east-1"),
    )

    
def ensure_bucket_exists(bucket: str) -> None:
    client = _internal_s3_client()
    try:
        client.head_bucket(Bucket=bucket)
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("404", "NoSuchBucket", "NotFound"):
            client.create_bucket(Bucket=bucket)
            return
        raise

def _internal_s3_client():
    # used for upload/delete inside docker network
    return _s3_client(settings.S3_ENDPOINT_URL)

def _public_s3_client():
    # used for presigned URLs returned to browser
    return _s3_client(settings.S3_PUBLIC_ENDPOINT_URL)

def upload_market_image(file_obj, *, user_id: int) -> UploadedObject:

    bucket = settings.S3_BUCKET_MARKET_IMAGES
    ensure_bucket_exists(bucket)

    original_name = getattr(file_obj, "name", "upload")
    ext = os.path.splitext(original_name)[1].lower() or ".jpg"
    key = f"market/{user_id}/{uuid.uuid4().hex}{ext}"

    content_type = getattr(file_obj, "content_type", None) or mimetypes.guess_type(original_name)[0] or "application/octet-stream"

    client = _internal_s3_client()
    client.upload_fileobj(
        Fileobj=file_obj,
        Bucket=bucket,
        Key=key,
        ExtraArgs={"ContentType": content_type},
    )
    return UploadedObject(key=key, bucket=bucket, content_type=content_type)



def presign_get_url(key: str, *, expires_seconds: int = 3600) -> str:
    client = _public_s3_client()
    return client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": settings.S3_BUCKET_MARKET_IMAGES, "Key": key},
        ExpiresIn=expires_seconds,
    )
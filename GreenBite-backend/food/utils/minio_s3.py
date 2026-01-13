import mimetypes
import os
import uuid
from dataclasses import dataclass

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

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


def _internal_s3_client():
    # used for upload/delete inside docker network
    return _s3_client(settings.S3_ENDPOINT_URL)


def _public_s3_client():
    return _s3_client(settings.S3_PUBLIC_ENDPOINT_URL)


# Backward-compatible / public API used by tasks & views
def s3_client(*, public: bool = False):
    """
    Returns an S3 client:
      - public=False (default): internal endpoint (server-to-minio)
      - public=True: public endpoint (browser-facing presign)
    """
    return _public_s3_client() if public else _internal_s3_client()


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
    return _s3_client(settings.S3_PUBLIC_ENDPOINT_URL)

# Update your upload functions to use internal client
def upload_profile_avatar(file_obj, *, user_id: int):
    bucket = settings.S3_BUCKET_PROFILE_AVATARS
    ensure_bucket_exists(bucket)

    original_name = getattr(file_obj, "name", "avatar")
    ext = os.path.splitext(original_name)[1].lower() or ".jpg"
    key = f"profiles/avatars/{user_id}/{uuid.uuid4().hex}{ext}"

    content_type = getattr(file_obj, "content_type", None) or mimetypes.guess_type(original_name)[0] or "application/octet-stream"

    client = _internal_s3_client()
    client.upload_fileobj(
        Fileobj=file_obj,
        Bucket=bucket,
        Key=key,
        ExtraArgs={"ContentType": content_type},
    )
    return UploadedObject(key=key, bucket=bucket, content_type=content_type)

def presign_get_profile_avatar_url(key: str, *, expires_seconds: int = 3600) -> str:
    client = _public_s3_client()
    return client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": settings.S3_BUCKET_PROFILE_AVATARS, "Key": key},
        ExpiresIn=expires_seconds,
    )




def ensure_bucket(bucket: str):
    s3 = _internal_s3_client()
    try:
        s3.head_bucket(Bucket=bucket)
        return
    except Exception:
        pass

    # MinIO commonly accepts this directly
    try:
        s3.create_bucket(Bucket=bucket)
    except Exception:
        # Some setups require LocationConstraint
        s3.create_bucket(
            Bucket=bucket,
            CreateBucketConfiguration={"LocationConstraint": settings.S3_REGION},
        )


def put_expire_lifecycle_rule(bucket: str, prefix: str, days: int):
    
    s3 = _internal_s3_client()
    s3.put_bucket_lifecycle_configuration(
        Bucket=bucket,
        LifecycleConfiguration={
            "Rules": [
                {
                    "ID": f"expire-{prefix.strip('/')}-{days}d",
                    "Status": "Enabled",
                    "Filter": {"Prefix": prefix},
                    "Expiration": {"Days": days},
                }
            ]
        },
    )

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

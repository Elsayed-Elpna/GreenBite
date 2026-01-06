import boto3
from django.conf import settings


def s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION,
    )


def ensure_bucket(bucket: str):
    s3 = s3_client()
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
    
    s3 = s3_client()
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
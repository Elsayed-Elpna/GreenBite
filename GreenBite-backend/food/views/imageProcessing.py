import base64
import json

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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
    
    img_bytes = img.read()
    b64 = base64.b64encode(img_bytes).decode("utf-8")
    data_url = f"data:{img.content_type};base64,{b64}"

    food_name = (request.data.get("food_name") or "").strip()
    storage = (request.data.get("storage") or "").strip()
    opened_days = (request.data.get("opened_days") or "").strip()
    notes = (request.data.get("notes") or "").strip()

    user_context = f"food_name={food_name}, storage={storage}, opened_days={opened_days}, notes={notes}".strip(", ")

    try:
        response = client.responses.create(
            model = "gpt-4.1-mini",
            store=False,
            instructions = (
                "You are a food safety assistant. You ONLY judge based on visible signs in the photo + user context. "
                "Be conservative: if uncertain, verdict must be 'unsure' and advise discarding or following label guidance. "
                "Never claim lab-level certainty or detect invisible bacteria/toxins."
            ),
            input=[{
                "role": "user",
                "content":[
                    {"type": "input_text", "text": f"Decide if this food is spoiled. Context: {user_context}"},
                    {"type": "input_image", "image_url": data_url, "detail": "high"},
                ],
            }],
            text={
                "format":{
                    "type": "json_schema",
                    "name": "food_spoilage_scan",
                    "strict": True,
                    "schema": SPOILAGE_SCHEMA
                }
            },
        )

        raw = (response.output_text or "").strip()
        try:
            parsed = json.loads(raw)
            return Response(parsed, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response(
                {"detail":"Model returned non-JSON output", "raw":raw[:500]},
                status=status.HTTP_502_BAD_GATEWAY
            )
        
    except Exception as e:
        return Response(
            {"detail": "Unexpected error while scanning image", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



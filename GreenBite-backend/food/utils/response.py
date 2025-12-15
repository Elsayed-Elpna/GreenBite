from rest_framework.response import Response
from rest_framework import status

def response(status_code, message, http_status_code ,data = None):
    return Response({
        "status": status_code,
        "message": message,
        "data": data
    }, status = http_status_code)

def success_response(message, data):
    return response(200, message, status.HTTP_200_OK, data)

def failed_response(status_code, message, data):
    return response(status_code, message, status.HTTP_400_BAD_REQUEST, data)


from django.http import JsonResponse

class BlockGetBodyMiddleware:
  def __init__(self, get_response):
    self.get_response = get_response
  
  def __call__(self, request):
    if request.method == 'GET':
      if request.body and request.body.strip():
        return JsonResponse(
          {"detail": "GET requests must not contain a request body."},
          status=400
        )
    return self.get_response(request)
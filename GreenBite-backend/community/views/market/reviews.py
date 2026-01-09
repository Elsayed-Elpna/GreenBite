# community/views/market/reviews.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from community.serializers.reviews import MarketReviewCreateSerializer, MarketReviewListSerializer
from community.services.review_service import ReviewService
from community.models import ComMarket, MarketReview
from community.pagination import StandardPagination
from django.db.models import Avg

class CreateReviewAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MarketReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            review = ReviewService.create_review(
                user=request.user,
                market_id=data['market_id'],
                rating=data['rating'],
                comment=data.get('comment')
            )
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)

        return Response({
            "review_id": review.id,
            "rating": review.rating,
            "created_at": review.created_at
        }, status=status.HTTP_201_CREATED)

class ListingReviewsAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardPagination

    def get(self, request, listing_id):
        market = ComMarket.objects.filter(id=listing_id).first()
        if not market:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

        reviews_qs = MarketReview.objects.filter(market=market).order_by('-created_at')
        average_rating = reviews_qs.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0

        # paginate
        paginator = StandardPagination()
        paginated_reviews = paginator.paginate_queryset(reviews_qs, request)
        serializer = MarketReviewListSerializer(paginated_reviews, many=True)

        response = paginator.get_paginated_response(serializer.data)
        response.data['average_rating'] = average_rating
        return response

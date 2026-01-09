from django.urls import path
from community.views.market.listings import MarketListingView, MarketListingDetailView
from community.views.market.orders import MarketOrderCreateAPIView, MarketOrderAcceptAPIView, MarketOrderStatusUpdateAPIView, BuyerOrdersListAPIView, SellerOrdersListAPIView, OrderDetailsAPIView
from community.views.market.reviews import CreateReviewAPIView, ListingReviewsAPIView

urlpatterns = [
    path("listings/", MarketListingView.as_view(), name="market-listings"),
    path("listings/<int:listing_id>/", MarketListingDetailView.as_view(), name="market-listing-detail"),
    path("orders/", MarketOrderCreateAPIView.as_view(), name="market-orders"),
    path("orders/<int:order_id>/accept/", MarketOrderAcceptAPIView.as_view(), name="accept-order"),
    path("orders/<int:order_id>/status/", MarketOrderStatusUpdateAPIView.as_view(), name="update-order"),
    path("orders/buyer/", BuyerOrdersListAPIView.as_view(), name="buyer-orders"),
    path("orders/seller/", SellerOrdersListAPIView.as_view(), name="seller-orders"),
    path("orders/<int:order_id>/", OrderDetailsAPIView.as_view(), name="order-details"),
    path('reviews/', CreateReviewAPIView.as_view(), name='create-review'),
    path('listings/<int:listing_id>/reviews/', ListingReviewsAPIView.as_view(), name='listing-reviews')
]
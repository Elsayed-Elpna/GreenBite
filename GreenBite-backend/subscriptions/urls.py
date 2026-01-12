from django.urls import path
from .views import subscription_plan_list, subscribe, my_subscription

urlpatterns = [
    path("subscription-plans/", subscription_plan_list, name="subscription-plan-list"),
    path("subscriptions/subscribe/", subscribe, name="subscribe"),
    path("subscriptions/me/", my_subscription, name="my-subscription"),

]
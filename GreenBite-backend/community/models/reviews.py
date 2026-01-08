# import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class MarketReview(models.Model):
    id = models.BigAutoField(primary_key=True)

    # Relations
    market = models.ForeignKey(
        'ComMarket',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='market_reviews'
    )

    # Review info
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'market_review'
        ordering = ['-created_at']
        unique_together = ('market', 'reviewer')  # one review per buyer per listing

    def __str__(self):
        return f"Review {self.id} - {self.market.title} - {self.rating} stars"

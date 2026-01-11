from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
# Create your models here.
class SubscriptionPlan(models.Model):
  MONTH = "month"
  SIX_MONTHS = "6_months"
  YEAR = "year"

  DURATION_CHOICES = [
      (MONTH, "1 Month"),
      (SIX_MONTHS, "6 Months"),
      (YEAR, "12 Months"),
    ]
  
  name = models.CharField(max_length=50)
  duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
  price = models.PositiveIntegerField()
  is_active = models.BooleanField(default=True)

  def get_end_date(self, start_date):
    if self.duration == self.MONTH:
      return start_date + timedelta(days=30)
    
    elif self.duration == self.SIX_MONTHS:
      return start_date + timedelta(days=180)
    
    elif self.duration == self.YEAR:
      return start_date + timedelta(days=365)
    
  def __str__(self):
      return self.name
    

class Subscription(models.Model):
  user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE , related_name="subscription")
  plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True)
  start_date = models.DateTimeField(null=True, blank=True)
  end_date = models.DateTimeField(null=True, blank=True)
  is_active = models.BooleanField(default=False)

  def activate(self,plan):
    now = timezone.now()
    self.plan = plan
    self.start_date = now
    self.end_date = plan.get_end_date(now)
    self.is_active = True
    self.save()
  
  def expire(self):
    if not self.is_active:
        return

    self.is_active = False
    self.save(update_fields=["is_active"])
    
    try:
        self.user.community_profile.suspend_seller()
    except Exception:
        pass

  
  def __str__(self):
    return f"{self.user} - {self.plan}"
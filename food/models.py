from datetime import timedelta, date
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class CategoryChoices(models.TextChoices):
    FRUIT = 'fruit', 'Fruit'
    VEGETABLE = 'vegetable', 'Vegetable'
    BREAD = 'bread', 'Bread'
    MEAT = 'meat', 'Meat'
    DAIRY = 'dairy', 'Dairy'
    GRAIN = 'grain', 'Grain'
    OTHER = 'other', 'Other'

class StorageTypeChoices(models.TextChoices):
    FRIDGE = 'fridge', 'Fridge'
    FREEZER = 'freezer', 'Freezer'
    ROOM_TEMP = 'room_temp', 'Room Temperature'
class FoodLogSys(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    quantity = models.FloatField()
    unit = models.CharField(max_length=20)
    category = models.CharField(
        max_length=20,
        choices=CategoryChoices.choices
    )
    expiry_date = models.DateField()
    storage_type = models.CharField(
        max_length=20,
        choices=StorageTypeChoices.choices
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit}) - Expires on {self.expiry_date}"
    class Meta:
        ordering = ['expiry_date']
        verbose_name = "Food Log Entry"
        verbose_name_plural = "Food Log Entries"
class MealTime(models.TextChoices):
    BREAKFAST = 'breakfast', 'Breakfast'
    LUNCH = 'lunch', 'Lunch'
    DINNER = 'dinner', 'Dinner'
    SNACK = 'snack', 'Snack'
    BRUNCH = 'brunch', 'Brunch'


class Meal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.TextField()
    ingredients = models.JSONField()
    serving = models.IntegerField(null=True, blank=True)
    waste = models.TextField(null=True, blank=True)
    calories = models.IntegerField(null=True, blank=True)
    has_leftovers = models.BooleanField(default=False)
     # Track if leftovers were already saved
    leftovers_saved = models.BooleanField(default=False) 
    leftovers = models.JSONField(null=True, blank=True)
    cuisine = models.CharField(max_length=100, null=True, blank=True)
    photo = models.TextField(null=True, blank=True)
    mealTime = models.CharField(
        max_length=20,
        choices=MealTime.choices
    )
    
    consumed_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s {self.get_mealTime_display()} - {self.consumed_at.date()}"
    
    def save_leftovers_to_food_log(self):
        if not self.has_leftovers or self.leftovers_saved:
            return 0        
        if not self.leftovers:
            return 0
        created_count = 0
        for leftover in self.leftovers:
            expiry_days = leftover.get('expiry_days', 3)
            expiry_date = leftover.get('expiry_date')
            if not expiry_date:
                expiry_date = date.today() + timedelta(days=expiry_days)
            
            FoodLogSys.objects.create(
                user=self.user,
                name=leftover.get('name', f'Leftover from {self.get_mealTime_display()}'),
                quantity=leftover.get('quantity', 1),
                unit=leftover.get('unit', 'portion'),
                category=leftover.get('category', CategoryChoices.OTHER),
                expiry_date=expiry_date,
                storage_type=leftover.get('storage_type', StorageTypeChoices.FRIDGE)
            )
            created_count += 1
        self.leftovers_saved = True
        self.save()
        
        return created_count
    
    class Meta:
        ordering = ['-consumed_at']
        verbose_name = "Meal"
        verbose_name_plural = "Meals"

 
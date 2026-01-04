from datetime import timedelta, date
from decimal import Decimal
from django.db import models
from django.utils import timezone

from project.utils.normalize import normalize_ingredient_name
from django.core.validators import MinValueValidator


class CategoryChoices(models.TextChoices):
    FRUIT = 'fruit', 'Fruit' #left side is what is stored in DB, rs is django display
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
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        
        validators=[MinValueValidator(Decimal("0"))]
    )
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
    name_normalized = models.CharField(max_length=120, blank=True, default="", db_index=True)
    is_consumed = models.BooleanField(default=False, db_index=True)

    def consume(self, used_qty: Decimal):
        if used_qty is None or used_qty <= 0:
            raise ValueError("used_qty must be > 0")
        if self.is_consumed:
            raise ValueError("FoodLog already consumed")
        if self.quantity < used_qty:
            raise ValueError("Not enough quantity available")

        self.quantity = self.quantity - used_qty
        if self.quantity <= 0:
            self.quantity = Decimal("0")
            self.is_consumed = True
        self.save(update_fields=["quantity", "is_consumed"])

    def save(self, *args, **kwargs):
        self.name_normalized = normalize_ingredient_name(self.name)
        super().save(*args, **kwargs)

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
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    recipe = models.TextField()
    ingredients = models.JSONField()
    serving = models.IntegerField(null=True, blank=True)
    waste = models.JSONField(default=list, blank=True) 
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

#input get it from ai and make crud operation 
class WasteLog(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="waste_logs")
    meal = models.ForeignKey(Meal, null=True, blank=True, on_delete=models.SET_NULL, related_name="waste_logs")

    name = models.CharField(max_length=100)
    why = models.TextField( )

    estimated_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )
    unit = models.CharField(max_length=20)

    disposal = models.CharField(
        max_length=50
    )

    reuse_ideas = models.JSONField(
        default=list,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        meal_part = f"for meal {self.meal_id}" if self.meal_id else ""
        return f"WasteLog({self.user_id}){meal_part} @ {self.created_at.date()}"
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Waste Log"
        verbose_name_plural = "Waste Logs"
class FoodLogUsage(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    recipe = models.ForeignKey("recipes.MealDBRecipe", on_delete=models.CASCADE)
    foodlog = models.ForeignKey("food.FoodLogSys", on_delete=models.CASCADE)
    used_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-used_at"]
        indexes = [
            models.Index(fields=["user", "used_at"]),
            models.Index(fields=["recipe"]),
            models.Index(fields=["foodlog"]),
        ]
    def __str__(self):
        return f"FoodLogUsage(user={self.user_id}, recipe={self.recipe_id}, foodlog={self.foodlog_id}, used_quantity={self.used_quantity})"

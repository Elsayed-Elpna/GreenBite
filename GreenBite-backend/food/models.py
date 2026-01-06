from datetime import timedelta, date
from decimal import Decimal
from django.db import models
from django.utils import timezone

from project.utils.normalize import normalize_ingredient_name
from django.core.validators import MinValueValidator
from django.conf import settings



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

class MealTime(models.TextChoices):
    BREAKFAST = 'breakfast', 'Breakfast'
    LUNCH = 'lunch', 'Lunch'
    DINNER = 'dinner', 'Dinner'
    SNACK = 'snack', 'Snack'
    BRUNCH = 'brunch', 'Brunch'
    DESSERT = 'dessert', 'Dessert'
    APPETIZER = 'appetizer', 'Appetizer'

class Meal(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    recipe = models.TextField()
    ingredients = models.JSONField()
    steps = models.JSONField(default=list, blank=True)
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
    source_mealdb_id = models.CharField(
        max_length=32,
        null=True,
        blank=True,
    )
    
    def __str__(self):
        return f"{self.user.username}'s {self.get_mealTime_display()} - {self.consumed_at.date()}"
    
    def save_leftovers_to_food_log(self):
        """
        Create FoodLog entries from meal leftovers.
        Assumes leftovers are already validated & saved.
        """
        if not self.leftovers or self.leftovers_saved:
            return 0

        created_count = 0

        for leftover in self.leftovers:
            expiry_days = leftover.get("expiry_days", 3)
            expiry_date = leftover.get("expiry_date")

            if not expiry_date:
                expiry_date = date.today() + timedelta(days=expiry_days)

            food_log = FoodLogSys.objects.create(
                user=self.user,
                meal=self,
                name=leftover.get(
                    "name",
                    f"Leftover from {self.get_mealTime_display()}"
                ),
                quantity=leftover.get("quantity", 1),
                unit=leftover.get("unit", "portion"),
                category=leftover.get("category", CategoryChoices.OTHER),
                expiry_date=expiry_date,
                storage_type=leftover.get(
                    "storage_type",
                    StorageTypeChoices.FRIDGE
                ),
            )

            # Link leftover JSON to FoodLog
            leftover["food_log_id"] = food_log.id
            created_count += 1

        # mark leftovers as saved & persist IDs
        self.leftovers_saved = True
        self.has_leftovers = True
        self.save(update_fields=["leftovers", "leftovers_saved", "has_leftovers", "updated_at"])

        return created_count
    
    class Meta:
        ordering = ['-consumed_at']
        verbose_name = "Meal"
        verbose_name_plural = "Meals"

class FoodLogSys(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    meal = models.ForeignKey(Meal, null=True, blank=True, on_delete=models.CASCADE, related_name="food_logs")
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

#input get it from ai and make crud operation 
class WasteLog(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="waste_logs")
    meal = models.ForeignKey(Meal, null=True, blank=True, on_delete=models.CASCADE, related_name="waste_logs")

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
    recipe = models.ForeignKey(
        "recipes.MealDBRecipe",
        on_delete=models.CASCADE,
        related_name="foodlog_usages",
        null=True,
        blank=True,
    )

    # ✅ MAP EXISTING DB COLUMN meal_id (do NOT create a new column)
    meal = models.ForeignKey(
        "food.Meal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="meal_id",
        related_name="foodlog_usages",
    )
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
class FoodSafetyScanJob(models.Model):
    STATUS_PENDING = "PENDING"
    STATUS_RUNNING = "RUNNING"
    STATUS_SUCCESS = "SUCCESS"
    STATUS_FAILED = "FAILED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_RUNNING, "Running"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="food_safety_scan_jobs")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)

    # store only a temp path; file will be deleted by worker
    image_path = models.TextField(blank=True, default="")
    # MinIO/S3 key (where the file lives)
    image_key = models.TextField(blank=True, default="")
    # request context
    food_name = models.CharField(max_length=255, blank=True, default="")
    storage = models.CharField(max_length=255, blank=True, default="")
    opened_days = models.CharField(max_length=64, blank=True, default="")
    notes = models.TextField(blank=True, default="")

    # result
    result = models.JSONField(null=True, blank=True)
    error = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

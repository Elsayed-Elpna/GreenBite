from django.contrib import admin
from .models import Meal , FoodLogSys , WasteLog

# Register your models here.

admin.site.register(Meal)
admin.site.register(FoodLogSys)
admin.site.register(WasteLog)
from django.db import migrations, models

def backfill_null_drafts(apps, schema_editor):
    MealPlanMeal = apps.get_model("meal_plans", "MealPlanMeal")
    MealPlanMeal.objects.filter(draft_cuisine__isnull=True).update(draft_cuisine="")
    MealPlanMeal.objects.filter(draft_title__isnull=True).update(draft_title="")
    MealPlanMeal.objects.filter(draft_photo__isnull=True).update(draft_photo="")
    MealPlanMeal.objects.filter(draft_source_mealdb_id__isnull=True).update(draft_source_mealdb_id="")

class Migration(migrations.Migration):
    dependencies = [
        ("meal_plans", "0002_mealplanmeal_draft_calories_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_null_drafts, migrations.RunPython.noop),

        # ensure defaults at model/db layer
        migrations.AlterField(
            model_name="mealplanmeal",
            name="draft_cuisine",
            field=models.CharField(max_length=64, blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="mealplanmeal",
            name="draft_title",
            field=models.CharField(max_length=255, blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="mealplanmeal",
            name="draft_photo",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="mealplanmeal",
            name="draft_source_mealdb_id",
            field=models.CharField(max_length=50, blank=True, default=""),
        ),
    ]
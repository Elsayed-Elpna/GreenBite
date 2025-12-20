# Generated manually to fix ingredients_norm field type from JSONB to ArrayField

from django.db import migrations
from django.contrib.postgres.operations import AddIndexConcurrently, RemoveIndexConcurrently


def convert_jsonb_to_array(apps, schema_editor):
    """
    Convert ingredients_norm from JSONB to text array.
    This handles the case where the field was accidentally created as JSONB.
    """
    if schema_editor.connection.vendor != 'postgresql':
        return
    
    with schema_editor.connection.cursor() as cursor:
        # First, check if the column exists and its type
        cursor.execute("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'recipes_mealdbrecipe' 
            AND column_name = 'ingredients_norm'
        """)
        result = cursor.fetchone()
        
        if result and result[0] == 'jsonb':
            # Convert JSONB to array
            # First, drop the GIN index if it exists
            cursor.execute("""
                DROP INDEX IF EXISTS mealdb_ing_norm_gin;
            """)
            
            # Convert the column type
            # First add a temporary column
            cursor.execute("""
                ALTER TABLE recipes_mealdbrecipe 
                ADD COLUMN ingredients_norm_temp text[];
            """)
            
            # Copy data from JSONB to array
            cursor.execute("""
                UPDATE recipes_mealdbrecipe 
                SET ingredients_norm_temp = (
                    SELECT ARRAY(SELECT jsonb_array_elements_text(ingredients_norm))
                    WHERE jsonb_typeof(ingredients_norm) = 'array'
                );
            """)
            
            # Drop the old column
            cursor.execute("""
                ALTER TABLE recipes_mealdbrecipe 
                DROP COLUMN ingredients_norm;
            """)
            
            # Rename the temp column
            cursor.execute("""
                ALTER TABLE recipes_mealdbrecipe 
                RENAME COLUMN ingredients_norm_temp TO ingredients_norm;
            """)
            
            # Set default
            cursor.execute("""
                ALTER TABLE recipes_mealdbrecipe 
                ALTER COLUMN ingredients_norm SET DEFAULT '{}';
            """)
            
            # Recreate the GIN index
            cursor.execute("""
                CREATE INDEX mealdb_ing_norm_gin 
                ON recipes_mealdbrecipe 
                USING GIN (ingredients_norm);
            """)


def reverse_conversion(apps, schema_editor):
    """
    Reverse: convert back to JSONB if needed (for migration rollback).
    """
    if schema_editor.connection.vendor != 'postgresql':
        return
    
    with schema_editor.connection.cursor() as cursor:
        # Drop the GIN index
        cursor.execute("""
            DROP INDEX IF EXISTS mealdb_ing_norm_gin;
        """)
        
        # Convert array back to JSONB
        cursor.execute("""
            ALTER TABLE recipes_mealdbrecipe 
            ALTER COLUMN ingredients_norm TYPE jsonb 
            USING to_jsonb(ingredients_norm);
        """)
        
        # Recreate the GIN index
        cursor.execute("""
            CREATE INDEX mealdb_ing_norm_gin 
            ON recipes_mealdbrecipe 
            USING GIN (ingredients_norm);
        """)


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(convert_jsonb_to_array, reverse_conversion),
    ]

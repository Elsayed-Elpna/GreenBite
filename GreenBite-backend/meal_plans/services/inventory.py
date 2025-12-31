from django.utils import timezone
from food.models import FoodLogSys
from project.utils.ingredient_synonyms import expand_ingredient_tokens
from project.utils.normalize import normalize_ingredient_name
from decimal import Decimal

class InventoryService:
    """Service for managing user's food inventory for meal planning."""
    
    def __init__(self, user):
        self.user = user
        self._available_logs = None
        self._inventory_tokens = None
        self._inventory_map = None

    def get_available_logs(self):
        # filter FoodLogSys for user, not expired, >0 quantity
        if self._available_logs is None:
            self._available_logs = FoodLogSys.objects.filter(
                user=self.user,
                is_consumed=False,
                expiry_date__gte=timezone.now().date(),
                quantity__gt=0
            ).select_related('user').order_by("expiry_date")
        return self._available_logs

    def get_inventory_tokens(self, use_synonyms=True):
        tokens= set()
        for log in self.get_available_logs():
            if use_synonyms:
                tokens.update(expand_ingredient_tokens(log.name))
            else:
                n = normalize_ingredient_name(log.name)
                if n:
                    tokens.add(n)
        self._inventory_tokens = tokens
        return self._inventory_tokens

    def map_food_logs(self):
        """
        Alias for get_inventory_map() for backward compatibility.
        
        Returns:
            dict: {normalized_name: total_quantity}
        """
        return self.get_inventory_map()
    
    def get_inventory_map(self):
        """
        Get a mapping of normalized ingredient name → total quantity available.
        """
        if self._inventory_map is None:
            inventory = {}
            
            for log in self.get_available_logs():
                key = normalize_ingredient_name(log.name)
                if not key:
                    continue
                
                from decimal import Decimal
                # Aggregate quantities for same ingredient
                inventory.setdefault(key, Decimal('0'))
                inventory[key] += log.quantity
            
            self._inventory_map = inventory
        
        return self._inventory_map

    # return set of normalized tokens using synonyms
    def get_expiry_weighted_inventory(self):
        inventory = {}
        for log in self.get_available_logs():
            key = normalize_ingredient_name(log.name)
            if not key:
                continue
            days_left = (log.expiry_date - timezone.now().date()).days
            weight = max(1, 30 - days_left)  # More weight for sooner expiry
            if key not in inventory:
                inventory[key] = {'quantity': Decimal('0'), 'weighted_score': 0}
            inventory[key]['quantity'] += log.quantity
            inventory[key]['weighted_score'] += log.quantity * weight
        return inventory
    def get_expiry_soon(self ,days=3):
        threshold_date = timezone.now().date() + timezone.timedelta(days=days)
        return self.get_available_logs().filter(expiry_date__lte=threshold_date)

        
    def get_food_log_summary(self):
        ava = self.get_available_logs()
        exp= self.get_expiry_soon(days=3)
        return {
            'total_items': ava.count(),
            'unique_ingredients': len(self.food_log_map()),
            'expiring_soon': exp.count(),
            'expiring_items': [
                {
                    'name': log.name,
                    'quantity': float(log.quantity),
                    'unit': log.unit,
                    'expiry_date': log.expiry_date,
                    'days_left': (log.expiry_date - timezone.now().date()).days
                }
                for log in exp
            ],
            'by_category': self._get_category_breakdown(ava),
        }
    def _get_category_breakdown(self, food_logs):
        category_map = {}
        for log in food_logs:
            cat = log.category or "other"
            if cat not in category_map:
                category_map[cat] = {'count': 0, 'total_quantity': Decimal('0')}
            category_map[cat]['count'] += 1
            category_map[cat]['total_quantity'] += log.quantity
        return category_map
    def has_ingredient(self, ingredient_name, minQ=None):
        norm = normalize_ingredient_name(ingredient_name)
        n_map= self.map_food_logs()

        if norm not in n_map:
            return False
        if minQ is not None:
            return n_map[norm] >= Decimal(str(minQ))

        if self.inventory_tokens is None:
            self.get_inventory_tokens()
        return norm in self.inventory_tokens
    def check_recipe_ingredients(self, recipe_ingredients):
        recipe_set = set(recipe_ingredients)
        inventory_tokens = self.get_inventory_tokens(use_synonyms=True)
        
        matched = recipe_set & inventory_tokens
        missing = recipe_set - inventory_tokens
        
        match_ratio = len(matched) / len(recipe_set) if recipe_set else 0
        
        return {
            'matched': matched,
            'missing': missing,
            'match_ratio': match_ratio,
            'matched_count': len(matched),
            'missing_count': len(missing),
        }
    
    def clear_cache(self):
        """Clear cached data (useful after inventory changes)."""
        self._available_logs = None
        self._inventory_tokens = None
        self._inventory_map = None




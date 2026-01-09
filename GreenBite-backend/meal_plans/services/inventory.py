from django.utils import timezone
from food.models import FoodLogSys
from project.utils.ingredient_synonyms import expand_ingredient_tokens
from project.utils.normalize import normalize_ingredient_name
from decimal import Decimal
def _safe_count(qs_or_list):
    if qs_or_list is None:
        return 0
    if hasattr(qs_or_list, "count"):
        return qs_or_list.count()
    try:
        return len(qs_or_list)
    except Exception:
        return 0

def _to_float(val):
    try:
        if val is None:
            return 0.0
        # Decimal -> float, dates remain as-is
        from decimal import Decimal
        if isinstance(val, Decimal):
            return float(val)
        return float(val)
    except Exception:
        return 0.0

class InventoryService:
    """Service for managing user's food inventory for meal planning."""
    
    def __init__(self, user):
        self.user = user
        self._available_logs = None
        self._inventory_tokens = None
        self._inventory_map = None
    @property
    def food_logs(self):
        return self.get_available_logs()

    @property
    def inventory_tokens(self):
        # return cached tokens or compute them
        if self._inventory_tokens is None:
            return self.get_inventory_tokens()
        return self._inventory_tokens

    @property
    def inventory_map(self):
        if self._inventory_map is None:
            return self.get_inventory_map()
        return self._inventory_map

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
        ava = self.get_available_logs() or []
        exp = self.get_expiry_soon(days=3) or []

        # prepare serialized expiring items
        exp_items = []
        days_list = []
        for log in (exp if hasattr(exp, "__iter__") else []):
            expiry_date = getattr(log, "expiry_date", getattr(log, "expiryDate", None))
            # compute days left safely
            try:
                days_left = (expiry_date - timezone.now().date()).days if expiry_date is not None else None
            except Exception:
                # fallback if expiry_date is a string
                try:
                    from datetime import datetime
                    expiry_dt = datetime.fromisoformat(str(expiry_date)).date()
                    days_left = (expiry_dt - timezone.now().date()).days
                except Exception:
                    days_left = None

            days_left = 0 if days_left is None else max(0, int(days_left))
            days_list.append(days_left)

            exp_items.append({
                "id": getattr(log, "id", None),
                "name": getattr(log, "name", None),
                "quantity": _to_float(getattr(log, "quantity", 0)),
                "unit": getattr(log, "unit", None),
                "expiry_date": getattr(expiry_date, "isoformat", lambda: expiry_date)(),
                "days_left": days_left,
                "category": getattr(log, "category", None),
            })

        total_items = _safe_count(ava)
        unique_ingredients = len(self.map_food_logs() or {})

        # aggregate quantities per unit (best-effort)
        qty_by_unit = {}
        for log in self.get_available_logs():
            unit = getattr(log, "unit", "unit") or "unit"
            qty_by_unit.setdefault(unit, 0.0)
            qty_by_unit[unit] += _to_float(getattr(log, "quantity", 0))

        # category breakdown with percentages and float totals
        raw_cat = self._get_category_breakdown(ava)
        by_category = {}
        for cat, info in raw_cat.items():
            count = info.get("count", 0)
            total_q = _to_float(info.get("total_quantity", 0))
            by_category[cat] = {
                "count": count,
                "total_quantity": total_q,
                "share": round((count / total_items) * 100, 1) if total_items else 0.0,
            }

        avg_days_left = round((sum(days_list) / len(days_list)), 1) if days_list else None
        soonest = None
        if exp_items:
            sorted_exp = sorted(exp_items, key=lambda x: x["days_left"])
            soonest = sorted_exp[0]

        top_expiring = sorted(exp_items, key=lambda x: x["days_left"])[:5]

        return {
            "total_items": total_items,
            "unique_ingredients": unique_ingredients,
            "expiring_soon": _safe_count(exp),
            "expiring_items": exp_items,
            "by_category": by_category,
            "quantity_by_unit": qty_by_unit,
            "avg_days_left": avg_days_left,
            "soonest_expiring": soonest,
            "top_expiring": top_expiring,
            "generated_at": timezone.now().isoformat(),
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




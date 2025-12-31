import hashlib
from django.core.cache import cache
def _hash_key(*parts: str) -> str:
    joined = "|".join([p or "" for p in parts])
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()

def _version_key(namespace: str, user_id: int) -> str:
    return f"{namespace}:list:v:{user_id}"

def get_list_version(namespace: str, user_id: int) -> int:
    v = cache.get(_version_key(namespace, user_id))
    if v is None:
        v = 1
        cache.set(_version_key(namespace, user_id), v, timeout = None)
    return int(v)

def bump_list_version(namespace: str, user_id:int) -> None:
    key = _version_key(namespace, user_id)
    try:
        cache.incr(key)
    except Exception:
        current = cache.get(key) or 1
        cache.set(key, int(current) + 1, timeout = None)

def detail_key(namespace: str, user_id: int, pk: int) -> str:
    return f"{namespace}:detail:{user_id}:{pk}"

def list_key(namespace:str, user_id:int, full_path: str) -> str:
    version = get_list_version(namespace, user_id)
    digest = _hash_key(full_path)
    return f"{namespace}:list:{user_id}:v{version}:{digest}"

#only related to meals_operations
def invalidate_cache(namespace, user_id: int, detail_id:int | None=None) -> None:
    bump_list_version(namespace, user_id)
    if detail_id is not None:
        cache.delete(detail_key(namespace, user_id, detail_id))

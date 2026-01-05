import time
from django.core.management.base import BaseCommand
from django.db import transaction

from recipes.models import MealDBRecipe
from food.utils.embeddings import embed_text


def _recipe_to_text(r: MealDBRecipe, max_instructions_chars: int = 1200, max_ingredients: int = 35) -> str:
    """
    Build a stable, compact text prompt for embeddings.
    Keep it bounded to reduce cost and improve consistency.
    """
    # ingredients can be list[dict] like {"name": "...", "measure": "..."} or list[str]
    names = []
    for it in (r.ingredients or []):
        if isinstance(it, dict):
            name = (it.get("name") or it.get("ingredient") or "").strip()
            if name:
                names.append(name)
        else:
            s = str(it or "").strip()
            if s:
                names.append(s)

    parts = [
        f"Title: {r.title or ''}",
        f"Cuisine: {r.cuisine or ''}",
        f"Category: {getattr(r, 'category', '') or ''}",
        "Ingredients: " + ", ".join(names[:max_ingredients]),
    ]

    instructions = (r.instructions or "").strip()
    if instructions:
        parts.append("Instructions: " + instructions[:max_instructions_chars])

    # drop empty lines
    return "\n".join([p for p in parts if p.strip()])


class Command(BaseCommand):
    help = "Generate embeddings for MealDBRecipe and store in embedding field (fast + safe batching)."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=0, help="0 = all")
        parser.add_argument("--batch-size", type=int, default=50, help="DB bulk_update batch size")
        parser.add_argument("--sleep", type=float, default=0.0, help="Sleep seconds between requests (rate limiting)")
        parser.add_argument(
            "--only-missing",
            action="store_true",
            help="Embed only recipes where embedding IS NULL (recommended).",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-embed even if embedding exists.",
        )
        parser.add_argument(
            "--max",
            type=int,
            default=0,
            help="Alias for --limit (kept for convenience).",
        )

    def handle(self, *args, **opts):
        limit = opts["limit"] or opts["max"]
        batch_size = int(opts["batch_size"])
        sleep_s = float(opts["sleep"])
        only_missing = bool(opts["only_missing"])
        force = bool(opts["force"])

        qs = MealDBRecipe.objects.all().order_by("id")
        if not force and only_missing:
            qs = qs.filter(embedding__isnull=True)
        elif not force and not only_missing:
            # default behavior as your old command: missing only
            qs = qs.filter(embedding__isnull=True)

        if limit and limit > 0:
            qs = qs[:limit]

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS("Nothing to embed."))
            return

        self.stdout.write(f"Embedding {total} MealDB recipes (batch_size={batch_size}, sleep={sleep_s}) ...")

        updated_buffer = []
        ok = 0
        skipped = 0
        failed = 0
        started = time.time()

        # Use iterator for memory efficiency
        for r in qs.iterator(chunk_size=200):
            text = _recipe_to_text(r)
            if not text.strip():
                skipped += 1
                continue

            try:
                emb = embed_text(text)
                if not emb:
                    failed += 1
                    continue
                r.embedding = emb
                updated_buffer.append(r)
                ok += 1
            except Exception as e:
                failed += 1
                # keep going; don't kill the whole batch
                self.stderr.write(f"[embed_meals] Failed id={r.id} title={r.title!r}: {e}")
                continue

            if sleep_s > 0:
                time.sleep(sleep_s)

            if len(updated_buffer) >= batch_size:
                with transaction.atomic():
                    MealDBRecipe.objects.bulk_update(updated_buffer, ["embedding"], batch_size=batch_size)
                elapsed = time.time() - started
                self.stdout.write(self.style.SUCCESS(
                    f"Progress: embedded={ok}/{total} skipped={skipped} failed={failed} elapsed={elapsed:.1f}s"
                ))
                updated_buffer.clear()

        if updated_buffer:
            with transaction.atomic():
                MealDBRecipe.objects.bulk_update(updated_buffer, ["embedding"], batch_size=batch_size)

        elapsed = time.time() - started
        self.stdout.write(self.style.SUCCESS(
            f"✅ Done. embedded={ok} skipped={skipped} failed={failed} total={total} elapsed={elapsed:.1f}s"
        ))

"""Re-encode project artwork from the best version git still holds.

The bug: `perf(core): optimize assets and image loading` (5345ef1) re-encoded the
project artwork with Pillow at `quality=70` and portrait images capped at 800px
wide. Measured against the blobs git had one commit earlier, that pass cost
13x-80x of the file size and, for several images, the resolution too.

This restores them. For each image it walks git history, takes the largest blob
the path ever had, checks that blob is *perceptually the same picture* as what is
shipped now (a later commit may have replaced the screenshot entirely), and if so
re-encodes that blob at a sane quality into `public/projects`.

Dry run by default; nothing is written without --apply.

Run:  python scripts/restore-image-quality.py
      python scripts/restore-image-quality.py --apply
"""

import argparse
import io
import os
import subprocess
import sys

from PIL import Image, ImageChops, ImageStat

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, "public", "projects")
OUT_ROOT = os.path.join(REPO, "public", "_image-audit")

# Re-encode target. 92 keeps the artwork visually intact for UI screenshots and
# text; the originals in history are ~q95 PNG-grade captures.
QUALITY = 92
METHOD = 6
# A portrait screenshot is rendered at most ~78vh of a tall window at DPR 2, so
# keep at least this much width before downscaling anything.
MIN_PORTRAIT_WIDTH = 940
# Mean absolute difference (0-255) below which two revisions are the same picture.
SAME_IMAGE_MAE = 6.0
# Only touch images that lost at least this much.
LOSS_RATIO = 2.0


def git(*args):
    return subprocess.run(["git", *args], cwd=REPO, capture_output=True, check=False)


def git_text(*args):
    return git(*args).stdout.decode("utf-8", "replace")


def best_blob(rel):
    """(bytes, revision, size) of the largest version git ever stored for `rel`."""
    revs = [r for r in git_text("log", "--format=%H", "--", rel).split() if r]
    best, best_rev = None, None
    for rev in revs:
        out = git_text("cat-file", "-s", f"{rev}:{rel}").strip()
        if not out.isdigit():
            continue
        n = int(out)
        if best is None or n > best:
            best, best_rev = n, rev
    if best_rev is None:
        return None
    return git("show", f"{best_rev}:{rel}").stdout, best_rev, best


def same_picture(a_bytes, b_bytes):
    """Mean absolute difference of two images, normalised to 64x64 grayscale."""
    try:
        a = Image.open(io.BytesIO(a_bytes)).convert("L").resize((64, 64))
        b = Image.open(io.BytesIO(b_bytes)).convert("L").resize((64, 64))
    except Exception:
        return None
    return ImageStat.Stat(ImageChops.difference(a, b)).mean[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write the re-encoded files")
    args = ap.parse_args()

    if args.apply:
        os.makedirs(OUT_ROOT, exist_ok=True)

    plan = []
    for dirpath, _, files in os.walk(ROOT):
        for fn in sorted(files):
            if not fn.lower().endswith(".webp"):
                continue
            fp = os.path.join(dirpath, fn)
            rel = os.path.relpath(fp, REPO).replace("\\", "/")
            current = open(fp, "rb").read()

            found = best_blob(rel)
            if not found:
                continue
            blob, rev, size = found
            if size / len(current) < LOSS_RATIO:
                continue

            mae = same_picture(blob, current)
            subject = git_text("log", "-1", "--format=%h %ad %s", "--date=short", rev).strip()
            plan.append({"rel": rel, "fp": fp, "blob": blob, "rev": rev, "subject": subject,
                         "current": current, "mae": mae})

    print(f"{'status':<18} {'now':>8} {'->':>8} {'ratio':>7} {'mae':>6}  file")
    print("-" * 92)
    written = 0
    skipped = 0
    for item in plan:
        rel, blob, current = item["rel"], item["blob"], item["current"]
        mae = item["mae"]
        short = rel.replace("public/projects/", "")

        if mae is None:
            print(f"{'UNREADABLE':<18} {len(current)/1024:7.1f}K {'-':>8} {'-':>7} {'?':>6}  {short}")
            skipped += 1
            continue
        if mae > SAME_IMAGE_MAE:
            # A later commit replaced the screenshot: restoring would resurrect
            # stale content, so leave it and re-capture from source instead.
            print(f"{'CONTENT CHANGED':<18} {len(current)/1024:7.1f}K {'-':>8} "
                  f"{len(blob)/len(current):6.2f}x {mae:6.2f}  {short}")
            print(f"{'':<18} history has a different picture ({item['subject']})")
            skipped += 1
            continue

        with Image.open(io.BytesIO(blob)) as im:
            im = im.convert("RGB") if im.mode != "RGB" else im
            w, h = im.size
            if h > w and w > MIN_PORTRAIT_WIDTH:
                nh = int(h * MIN_PORTRAIT_WIDTH / w)
                im = im.resize((MIN_PORTRAIT_WIDTH, nh), Image.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, "WEBP", quality=QUALITY, method=METHOD)
            out = buf.getvalue()
            dims = f"{im.size[0]}x{im.size[1]}"

        # Idempotence: if shipping now is already as good as a fresh re-encode
        # from history, there is nothing left to win. Without this the command
        # reports the same eight files forever and stops being a signal.
        if len(out) <= len(current) * 1.05:
            print(f"{'ALREADY OK':<18} {len(current)/1024:7.1f}K {len(out)/1024:7.1f}K "
                  f"{len(blob)/len(current):6.2f}x {mae:6.2f}  {short}  [{dims} q{QUALITY}]")
            skipped += 1
            continue

        print(f"{'RE-ENCODE':<18} {len(current)/1024:7.1f}K {len(out)/1024:7.1f}K "
              f"{len(blob)/len(current):6.2f}x {mae:6.2f}  {short}  [{dims} q{QUALITY}]")

        if args.apply:
            # The re-encode is deliberately LARGER than what ships today: the
            # whole point is to buy back the detail the quality-70 pass threw
            # away. It is still far below the blob in history (q92 < the q95
            # capture), so the artwork stays a sane size on the wire.
            keep = os.path.join(OUT_ROOT, rel.replace("public/projects/", "").replace("/", "__"))
            with open(keep, "wb") as fh:
                fh.write(current)
            with open(item["fp"], "wb") as fh:
                fh.write(out)
            written += 1
            print(f"{'':<18} +{(len(out) - len(current)) / 1024:.0f}K on disk "
                  f"(history blob was {len(blob) / 1024:.0f}K)")

    print("-" * 92)
    print(f"{len(plan)} candidates, {written} written, {skipped} skipped (dry run: {not args.apply})")
    if args.apply:
        print(f"replaced originals kept in {os.path.relpath(OUT_ROOT, REPO)} for A/B")
    return 0


if __name__ == "__main__":
    sys.exit(main())

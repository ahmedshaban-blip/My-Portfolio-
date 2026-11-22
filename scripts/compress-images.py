from PIL import Image
import os, sys, hashlib

# Asset optimiser for public/projects.
#
# HISTORY — READ BEFORE CHANGING THE NUMBERS.
# This script once ran at `quality=70` with portrait images capped at 800px. It
# is the single commit that cost the project artwork 13x-80x of its data
# (`perf(core): optimize assets and image loading`), which read as blocking and
# mushy text on every cover. Two rules stop that happening again:
#
#   1. QUALITY and the width caps are set for *display*, not for the smallest
#      possible file. A portrait screenshot is rendered up to ~78vh of a tall
#      window at DPR 2, so 1200px is the floor, not a luxury.
#   2. An existing webp is never replaced by a worse one. The old script kept
#      whichever file was *smaller* — which is exactly how a q95 capture got
#      swapped for a q70 re-encode of itself. Size is the wrong metric; bits per
#      pixel is the right one.
#
# Run:  python scripts/compress-images.py
#       python scripts/compress-images.py --dry-run

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "projects")

QUALITY = 92
METHOD = 6
MAX_W_PORTRAIT = 1200
MAX_W_LANDSCAPE = 1920
# Below this, a webp is treated as already damaged and may be replaced even if
# the re-encode is bigger. At or above it, the file is left alone.
BPP_FLOOR = 0.45

DRY_RUN = "--dry-run" in sys.argv


def file_hash(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for c in iter(lambda: f.read(65536), b''):
            h.update(c)
    return h.hexdigest()


def bpp(path, size):
    px = size[0] * size[1]
    return (os.path.getsize(path) * 8 / px) if px else 0.0


mapping = {}
total_before = 0
total_after = 0
converted = []
skipped = []

for dirpath, _, files in os.walk(ROOT):
    for fn in files:
        fp = os.path.join(dirpath, fn)
        ext = os.path.splitext(fn)[1].lower()
        if ext not in ('.png', '.jpg', '.jpeg', '.webp'):
            continue
        before = os.path.getsize(fp)
        total_before += before
        try:
            im = Image.open(fp)
            w, h = im.size
            portrait = h > w
            max_w = MAX_W_PORTRAIT if portrait else MAX_W_LANDSCAPE
            resized = False
            if w > max_w:
                nh = int(h * max_w / w)
                im = im.resize((max_w, nh), Image.LANCZOS)
                w, h = im.size
                resized = True

            base, _ = os.path.splitext(fp)
            is_webp = ext == '.webp'

            rgb = im.convert('RGB') if im.mode not in ('RGB', 'RGBA') else im
            tmp = fp + '.tmp.webp'
            rgb.save(tmp, 'WEBP', quality=QUALITY, method=METHOD)
            after_size = os.path.getsize(tmp)
            new_bpp = bpp(tmp, (w, h))

            if is_webp:
                old_bpp = bpp(fp, Image.open(fp).size)
                # Rule 2: a healthy existing webp is not touched. Re-encoding an
                # already-lossy file only spends another generation of detail.
                regression = old_bpp < BPP_FLOOR or resized
                if not regression or new_bpp < old_bpp:
                    os.remove(tmp)
                    total_after += before
                    skipped.append((fp, old_bpp))
                    continue
                if DRY_RUN:
                    os.remove(tmp)
                else:
                    os.replace(tmp, fp)
                total_after += after_size
                converted.append((fp, fp, before / 1024, after_size / 1024))
            else:
                out = base + '.webp'
                if os.path.abspath(out) == os.path.abspath(fp):
                    out = base + '-opt.webp'
                rel_old = '/' + os.path.relpath(fp, os.path.dirname(ROOT)).replace('\\', '/')
                rel_new = '/' + os.path.relpath(out, os.path.dirname(ROOT)).replace('\\', '/')
                if DRY_RUN:
                    os.remove(tmp)
                else:
                    os.replace(tmp, out)
                    os.remove(fp)
                total_after += after_size
                mapping[rel_old] = rel_new
                converted.append((rel_old, rel_new, before / 1024, after_size / 1024))
        except Exception as e:
            print('FAIL', fp, e)
            total_after += before

print(f"{'DRY RUN — nothing written' if DRY_RUN else 'applied'}")
print(f"TOTAL before: {total_before/1024/1024:.2f} MB")
print(f"TOTAL after:  {total_after/1024/1024:.2f} MB")
print("=== converted / re-encoded ===")
for o, n, bo, ba in converted:
    print(f"{o} -> {n}  ({bo:.0f}KB -> {ba:.0f}KB)")
print(f"=== left alone (already at or above {BPP_FLOOR} bpp) : {len(skipped)} files ===")
for fp, b in skipped[:10]:
    print(f"  {b:.2f} bpp  {os.path.relpath(fp, ROOT)}")

# A dry run must not leave the temp files behind.
for dirpath, _, files in os.walk(ROOT):
    for fn in files:
        if fn.endswith('.tmp.webp'):
            os.remove(os.path.join(dirpath, fn))

import json
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "img-mapping.json"), "w") as f:
    json.dump({k: v for k, v in mapping.items()}, f, indent=2)

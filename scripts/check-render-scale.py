"""Source detail vs what the card actually paints.

The complaint is "the files look great but the site shows them badly", so the
question is not the file quality — it is how many source pixels the card spends
per painted pixel. Anything under 1.0 is being enlarged on screen.

Run:  python scripts/check-render-scale.py
"""

import os
import sys

from PIL import Image

ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "projects",
)

# The card's media box (measured from the running site) and the browser's DPR.
DESKTOP_TILE = (176, 358)
DESKTOP_DPR = 1.25
# Below sm: the panel goes full width of the card and 3/4 tall.
MOBILE_PANEL = (356, 475)
MOBILE_DPR = 3.0


def report(label, box, dpr):
    print(f"\n{label}  (box {box[0]}x{box[1]} css, dpr {dpr} "
          f"-> {round(box[0]*dpr)}x{round(box[1]*dpr)} device px)")
    print(f"{'file':<38} {'source':>11} {'scale':>7}  {'cover shows':>12}  verdict")
    print("-" * 88)

    rows = []
    for dirpath, _, files in os.walk(ROOT):
        for fn in sorted(files):
            if not fn.lower().endswith(".webp"):
                continue
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, ROOT).replace("\\", "/")
            if "web-" in fn:
                continue  # web cards use a 16:9 banner, not this box
            with Image.open(p) as im:
                w, h = im.size
            dev_w = box[0] * dpr
            dev_h = box[1] * dpr
            # object-cover: the image is scaled until it covers the box.
            scale = max(dev_w / w, dev_h / h)
            # Fraction of the source height that survives the crop.
            shown = min(1.0, (dev_h / scale) / h) if scale else 0
            rows.append((scale, rel, w, h, shown))

    for scale, rel, w, h, shown in sorted(rows):
        verdict = "ENLARGED" if scale > 1.02 else "ok"
        print(f"{rel:<38} {w}x{h:<6} {scale:6.2f}x {shown*100:11.0f}%  {verdict}")


if __name__ == "__main__":
    report("DESKTOP / sm+ tile", DESKTOP_TILE, DESKTOP_DPR)
    report("PHONE / below sm panel", MOBILE_PANEL, MOBILE_DPR)
    sys.exit(0)

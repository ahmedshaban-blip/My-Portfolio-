"""Contact sheet: pre-regression blob (left) vs what ships today (right).

Reads the copies scripts/compare-pre-regression.py pulled out of git and pairs
them with the current artwork, so a human can confirm the older revision is the
same screen at better quality rather than a different design.

Run:  python scripts/compare-pre-regression.py
"""

import os
import subprocess
import sys

from PIL import Image, ImageDraw

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRE = os.path.join(os.environ.get("TEMP", "/tmp"), "opencode", "pre-regression")
OUT = os.path.join(PRE, "contact-sheet.png")

# path in repo -> blob revision that still holds the pre-regression artwork
TARGETS = [
    ("cv-builder/shot-1.webp", "7171ba7"),
    ("cv-builder/shot-2.webp", "7171ba7"),
    ("cv-builder/shot-3.webp", "7171ba7"),
    ("cv-builder/shot-4.webp", "7171ba7"),
    ("cv-builder/shot-5.webp", "7171ba7"),
    ("cv-builder/shot-6.webp", "7171ba7"),
    ("elmatgar/web-1-home.webp", "5b2a652"),
    ("upcourse/web-1-home.webp", "5b2a652"),
    ("upcourse/web-2-courses.webp", "5b2a652"),
]

CELL = 260
LABEL = 18


def current(rel):
    return os.path.join(REPO, "public", "projects", rel)


def pre(rel):
    return os.path.join(PRE, rel.replace("/", "__"))


def fit(im, box):
    im = im.convert("RGB")
    im.thumbnail((box, box), Image.LANCZOS)
    return im


def main():
    rows = []
    for rel, rev in TARGETS:
        if not os.path.exists(pre(rel)) or not os.path.exists(current(rel)):
            print("missing", rel)
            continue
        rows.append(rel)

    if not rows:
        print("nothing to compare — run the git extraction first")
        return 1

    cols = 2
    sheet = Image.new("RGB", (CELL * cols, (CELL + LABEL) * len(rows)), (20, 20, 20))
    draw = ImageDraw.Draw(sheet)

    for i, rel in enumerate(rows):
        y = i * (CELL + LABEL)
        a = fit(Image.open(pre(rel)), CELL)
        b = fit(Image.open(current(rel)), CELL)
        sheet.paste(a, (8, y + LABEL))
        sheet.paste(b, (CELL + 8, y + LABEL))
        pa, pb = pre(rel), current(rel)
        draw.text((8, y + 4), f"PRE  {os.path.getsize(pa)//1024}K  {os.path.basename(rel)}", fill=(160, 220, 160))
        draw.text((CELL + 8, y + 4), f"NOW  {os.path.getsize(pb)//1024}K", fill=(240, 160, 160))

    sheet.save(OUT)
    print("wrote", OUT)
    print(f"{len(rows)} pairs, left = pre-regression from git, right = shipped today")
    return 0


if __name__ == "__main__":
    sys.exit(main())

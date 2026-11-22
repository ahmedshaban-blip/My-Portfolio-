"""Extract the pre-regression artwork from git into a scratch folder.

`git show <rev>:<path> > file` in PowerShell corrupts the bytes (it treats the
pipe as text and re-encodes it), so the blob is written through git's own
`--output` instead.

Run:  python scripts/compare-pre-regression.py   (calls this first)
"""

import os
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRE = os.path.join(os.environ.get("TEMP", "/tmp"), "opencode", "pre-regression")

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


def main():
    os.makedirs(PRE, exist_ok=True)
    for rel, rev in TARGETS:
        dest = os.path.join(PRE, rel.replace("/", "__"))
        src = f"{rev}:public/projects/{rel}"
        # `git show` via a PowerShell pipe re-encodes the bytes, and `--output`
        # wrote nothing here, so read the blob through cat-file's raw stdout.
        res = subprocess.run(
            ["git", "cat-file", "blob", src],
            cwd=REPO, capture_output=True, check=False,
        )
        if res.returncode != 0:
            print("FAIL", src, res.stderr.decode("utf-8", "replace").strip())
            continue
        with open(dest, "wb") as fh:
            fh.write(res.stdout)
        print(f"{os.path.getsize(dest):>9} bytes  {rev}  {rel}")
    print(f"\npre-regression copies in {PRE}")


if __name__ == "__main__":
    main()

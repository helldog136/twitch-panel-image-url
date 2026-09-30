#!/usr/bin/env python3
"""Package the extension into a Twitch-ready zip.

Windows tools like PowerShell's Compress-Archive store nested-folder zip
entries with backslashes (css\\style.css), which Twitch's asset hosting
can't resolve against the forward-slash paths used in <link>/<script> tags
-- CSS and JS then silently fail to load. This script always writes
forward-slash entry names.

Usage: python package.py <version>
"""

import sys
import zipfile
from pathlib import Path

FILES = ["config.html", "panel.html"]
DIRS = ["css", "js"]


def main():
    if len(sys.argv) != 2:
        print("Usage: python package.py <version>")
        sys.exit(1)

    version = sys.argv[1]
    root = Path(__file__).parent
    out_path = root / f"twitch-extension-{version}.zip"

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in FILES:
            zf.write(root / name, arcname=name)
        for dirname in DIRS:
            for path in sorted((root / dirname).rglob("*")):
                if path.is_file():
                    zf.write(path, arcname=path.relative_to(root).as_posix())

    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()

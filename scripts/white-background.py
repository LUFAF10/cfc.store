#!/usr/bin/env python3
"""
Removes the background from all product images and replaces it with white.
Processes CAMISETAS, BUZOS and SHORTS folders.
Original files are overwritten.
"""

import os
import sys
from pathlib import Path
from PIL import Image
from rembg import remove

FOLDERS = ["CAMISETAS", "SHORTS"]
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def process_image(path: Path) -> None:
    print(f"  Processing: {path.name}")
    with open(path, "rb") as f:
        input_data = f.read()

    # Remove background → RGBA
    output_data = remove(input_data)
    img = Image.open(__import__("io").BytesIO(output_data)).convert("RGBA")

    # Composite onto white background
    background = Image.new("RGBA", img.size, (255, 255, 255, 255))
    background.paste(img, mask=img.split()[3])
    result = background.convert("RGB")

    # Save as JPEG (overwrite original)
    save_path = path.with_suffix(".jpg")
    result.save(save_path, "JPEG", quality=92)

    # If original was .jpeg, remove it (save_path is already .jpg)
    if path.suffix.lower() == ".jpeg" and save_path != path:
        path.unlink()

def main():
    base = Path(__file__).parent.parent / "public" / "images"

    for folder in FOLDERS:
        folder_path = base / folder
        if not folder_path.exists():
            print(f"Skipping {folder} (folder not found)")
            continue

        images = [p for p in folder_path.iterdir() if p.suffix.lower() in IMAGE_EXTS]
        if not images:
            print(f"Skipping {folder} (no images)")
            continue

        print(f"\n── {folder} ({len(images)} images) ──────────────────")
        for img_path in sorted(images):
            try:
                process_image(img_path)
            except Exception as e:
                print(f"  ERROR {img_path.name}: {e}")

    print("\n✓ Done. All images now have a white background.")

if __name__ == "__main__":
    main()

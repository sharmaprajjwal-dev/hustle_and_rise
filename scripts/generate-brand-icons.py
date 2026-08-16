from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/brand/hustle-rise-mark.png"

image = Image.open(SOURCE).convert("RGBA")
alpha_box = image.getchannel("A").getbbox()
if alpha_box is None:
    raise RuntimeError("Brand mark has no visible pixels")

cropped = image.crop(alpha_box)
side = max(cropped.size)
padding = round(side * 0.12)
canvas = Image.new("RGBA", (side + padding * 2, side + padding * 2), (0, 0, 0, 0))
canvas.alpha_composite(cropped, ((canvas.width - cropped.width) // 2, (canvas.height - cropped.height) // 2))

outputs = {
    ROOT / "public/brand/hustle-rise-mark-256.png": 256,
    ROOT / "public/favicon-32.png": 32,
    ROOT / "public/icon-192.png": 192,
    ROOT / "public/apple-touch-icon.png": 180,
}

for path, size in outputs.items():
    resized = canvas.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(path, optimize=True)
    print(f"Wrote {path.relative_to(ROOT)} ({size}x{size})")

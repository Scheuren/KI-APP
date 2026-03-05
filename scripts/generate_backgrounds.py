"""
generate_backgrounds.py
Generiert KI-Hintergrundbilder für Level 2-5 via Together AI (FLUX.1.1-pro).

Ausführen:
  python scripts/generate_backgrounds.py
"""

import base64
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_KEY  = "150e5ad21226801297f09b1ae021df484eec4586ada748917e9db15773652574"
API_URL  = "https://api.together.xyz/v1/images/generations"
MODEL    = "black-forest-labs/FLUX.1.1-pro"
OUT_DIR  = Path(__file__).parent.parent / "public" / "game" / "backgrounds"

# Stil-Präambel: Comic-Noir, passend zum Spiel
STYLE = (
    "comic book illustration style, bold black outlines, cel-shading, "
    "neo-noir detective game background, vibrant colors with dark shadows, "
    "no text, no characters, wide landscape scene, game background art, "
    "16:9 aspect ratio"
)

BACKGROUNDS = [
    {
        "filename": "interrogation-room.png",
        "prompt": (
            f"A dark police interrogation room, single overhead spotlight illuminating a metal table "
            f"with two chairs, brick wall with one-way mirror, dramatic shadows, tense atmosphere. {STYLE}"
        ),
    },
    {
        "filename": "ai-lab.png",
        "prompt": (
            f"A futuristic AI research laboratory, multiple holographic screens displaying neural networks "
            f"and data visualizations, neon blue and purple glow, server racks, high-tech equipment, "
            f"sleek and mysterious. {STYLE}"
        ),
    },
    {
        "filename": "analysis-lab.png",
        "prompt": (
            f"A high-tech data analysis lab, large curved monitors showing graphs and surveillance footage, "
            f"digital forensics workstation, yellow warning lights, maps pinned to wall, "
            f"detective investigation setup. {STYLE}"
        ),
    },
    {
        "filename": "ethics-chamber.png",
        "prompt": (
            f"A dramatic courtroom-style ethics council chamber, circular seating arrangement, "
            f"a central podium under a spotlight, abstract scales of justice motif, "
            f"imposing stone walls, cinematic lighting with red and gold accents. {STYLE}"
        ),
    },
]


def generate_image(prompt: str, filename: str) -> bool:
    payload = json.dumps({
        "model":  MODEL,
        "prompt": prompt,
        "width":  1024,
        "height": 576,
        "steps":  28,
        "n":      1,
        "response_format": "b64_json",
    }).encode("utf-8")

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type":  "application/json",
            "User-Agent":    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ❌ HTTP {e.code}: {body[:200]}")
        return False
    except Exception as e:
        print(f"  ❌ Fehler: {e}")
        return False

    img_b64 = data["data"][0]["b64_json"]
    img_bytes = base64.b64decode(img_b64)

    out_path = OUT_DIR / filename
    out_path.write_bytes(img_bytes)
    print(f"  ✅ Gespeichert: {out_path.name} ({len(img_bytes)//1024} KB)")
    return True


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"🎨 Generiere {len(BACKGROUNDS)} Hintergrundbilder mit {MODEL}\n")

    success = 0
    for i, bg in enumerate(BACKGROUNDS, 1):
        print(f"[{i}/{len(BACKGROUNDS)}] {bg['filename']}")
        print(f"  Prompt: {bg['prompt'][:80]}...")
        if generate_image(bg["prompt"], bg["filename"]):
            success += 1
        print()

    print(f"{'='*50}")
    print(f"✅ Fertig! {success}/{len(BACKGROUNDS)} Bilder generiert")
    if success > 0:
        print("\nNächster Schritt: Level-Seiten auf .png aktualisieren")


if __name__ == "__main__":
    main()

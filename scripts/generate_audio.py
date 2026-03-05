"""
generate_audio.py
Generiert Sprachausgabe für alle Spiel-Dialoge mit Qwen3-TTS (LOKAL auf GPU).

Voraussetzungen:
  pip install torch --index-url https://download.pytorch.org/whl/cu124
  pip install qwen-tts soundfile

Ausführen:
  1. npx tsx scripts/extract_dialogs.ts     (erzeugt scripts/dialogs.json)
  2. python scripts/generate_audio.py        (erzeugt public/game/audio/*)

Beim ersten Start: Modell (~3.5 GB) wird automatisch von HuggingFace heruntergeladen.
"""

import json
import sys
import time
from pathlib import Path

import soundfile as sf
import torch

# Windows: UTF-8 für Emoji-Ausgabe erzwingen
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────────────────────────────────────
# Konfiguration
# ─────────────────────────────────────────────────────────────────────────────

DIALOGS_JSON  = Path(__file__).parent / "dialogs.json"
OUTPUT_DIR    = Path(__file__).parent.parent / "public" / "game" / "audio"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"

MODEL_ID = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"

# ─────────────────────────────────────────────────────────────────────────────
# Charakter → Stimme + Stil
# Verfügbare Sprecher: Aiden, Dylan, Eric, Ono_anna, Ryan, Serena, Sohee, Uncle_fu, Vivian
# ─────────────────────────────────────────────────────────────────────────────

VOICE_MAP: dict[str, tuple[str, str]] = {
    "Inspector Node": (
        "Ryan",
        "Speak slowly and with calm authority, like a wise detective mentor guiding a young apprentice. "
        "Deep, measured, slightly formal. Very clear pronunciation.",
    ),
    "{NAME}": (
        "Dylan",
        "Speak curiously and enthusiastically, like a motivated young person experiencing something exciting. "
        "Light, energetic, natural pace.",
    ),
    "Viktor": (
        "Aiden",
        "Speak nervously and defensively, like someone trying to convince others of their innocence. "
        "Slightly higher pitch under pressure.",
    ),
    # Weibliche Verdächtige
    "Rosa R.":  ("Serena",   "Speak calmly and matter-of-factly, like a friendly bookshop worker."),
    "Lisa L.":  ("Vivian",   "Speak naturally, like a student — curious and open."),
    "Erna E.":  ("Ono_anna", "Speak gently and a bit formally, like an older woman."),
    # Männliche Verdächtige
    "Otto O.":  ("Eric",     "Speak in a gruff, slightly suspicious tone, like someone with something to hide."),
    "Max M.":   ("Uncle_fu", "Speak loudly and conspicuously, like someone overdoing their innocence act."),
    "Bert B.":  ("Aiden",    "Speak precisely and businesslike, like a salesman."),
    # Default
    "default":  ("Eric",     "Speak clearly and naturally in a neutral voice."),
}


def get_voice(speaker: str) -> tuple[str, str]:
    """Gibt (speaker_name, instruct) für einen Charakter zurück."""
    if speaker in VOICE_MAP:
        return VOICE_MAP[speaker]
    if "{NAME}" in speaker or "Detektiv" in speaker:
        return VOICE_MAP["{NAME}"]
    return VOICE_MAP["default"]


# ─────────────────────────────────────────────────────────────────────────────
# djb2-Hash (muss identisch mit useTTS.ts sein)
# ─────────────────────────────────────────────────────────────────────────────

def djb2(text: str) -> str:
    h = 5381
    for ch in text:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    return format(h, '08x')


# ─────────────────────────────────────────────────────────────────────────────
# Hauptprogramm
# ─────────────────────────────────────────────────────────────────────────────

def main():
    # dialogs.json prüfen
    if not DIALOGS_JSON.exists():
        print(f"❌ {DIALOGS_JSON} nicht gefunden.")
        print("   Bitte zuerst ausführen: npx tsx scripts/extract_dialogs.ts")
        return

    with open(DIALOGS_JSON, encoding="utf-8") as f:
        data = json.load(f)

    unique_entries: list[dict] = data["unique"]
    print(f"📋 {len(unique_entries)} einzigartige Dialog-Zeilen gefunden")

    # Ausgabe-Ordner erstellen
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Bestehendes Manifest laden (für Resume)
    manifest: dict[str, str] = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, encoding="utf-8") as f:
            manifest = json.load(f)
        print(f"📁 Bestehendes Manifest geladen: {len(manifest)} Einträge")

    # GPU prüfen
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb  = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"🖥️  GPU: {gpu_name} ({vram_gb:.1f} GB VRAM)")
    else:
        print("⚠️  Kein CUDA gefunden — CPU-Modus (langsam!)")

    # Modell laden
    print(f"\n🔄 Lade Modell {MODEL_ID}...")
    print("   (Beim ersten Start: ~3.5 GB Download von HuggingFace)")
    try:
        from qwen_tts import Qwen3TTSModel
        model = Qwen3TTSModel.from_pretrained(
            MODEL_ID,
            device_map=device,
            dtype=torch.bfloat16,
        )
        print("✅ Modell geladen!\n")
    except Exception as e:
        print(f"❌ Modell konnte nicht geladen werden: {e}")
        return

    # Audio generieren
    generated = 0
    skipped   = 0
    errors    = 0
    t_start   = time.time()

    for i, entry in enumerate(unique_entries):
        text:     str = entry["text"]
        speaker:  str = entry["speaker"]
        entry_id: str = entry["id"]

        # Platzhalter ersetzen für TTS
        tts_text = text.replace("{NAME}", "der Detektiv")

        # Hash-Key für Manifest
        manifest_key = f"{djb2(tts_text)}_{djb2(speaker)}"

        # Level-Unterordner
        level_num = entry.get("level", 0)
        level_dir = OUTPUT_DIR / f"level{level_num}"
        level_dir.mkdir(exist_ok=True)

        out_file = level_dir / f"{entry_id}.wav"
        rel_path = f"/game/audio/level{level_num}/{entry_id}.wav"

        # Bereits generiert → überspringen
        if manifest_key in manifest and out_file.exists():
            skipped += 1
            print(f"  ⏭  [{i+1}/{len(unique_entries)}] Übersprungen: {entry_id}")
            continue

        # Stimme ermitteln
        tts_speaker, instruct = get_voice(speaker)
        print(f"  🎙  [{i+1}/{len(unique_entries)}] {speaker} → {tts_speaker}: {tts_text[:55]}...")

        try:
            wavs, sr = model.generate_custom_voice(
                text=tts_text,
                language="German",
                speaker=tts_speaker,
                instruct=instruct,
            )
            sf.write(str(out_file), wavs[0], sr)
            manifest[manifest_key] = rel_path
            generated += 1
            print(f"     ✅ Gespeichert: {out_file.name}")

        except Exception as e:
            print(f"     ❌ Fehler: {e}")
            errors += 1

        # Manifest nach jedem Eintrag speichern (Resume bei Abbruch)
        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

    # Abschlussbericht
    elapsed = int(time.time() - t_start)
    print(f"\n{'='*50}")
    print(f"✅ Fertig! ({elapsed}s)")
    print(f"   Generiert:    {generated}")
    print(f"   Übersprungen: {skipped}")
    print(f"   Fehler:       {errors}")
    print(f"   Manifest:     {MANIFEST_PATH}")
    if generated > 0:
        print(f"\nNächster Schritt:")
        print(f"   git add public/game/audio/ && git commit -m 'feat: Qwen3-TTS Audiodateien' && git push")


if __name__ == "__main__":
    main()

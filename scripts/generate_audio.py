"""
generate_audio.py
Generiert Sprachausgabe für alle Spiel-Dialoge mit Qwen3-TTS (HuggingFace API).

Voraussetzungen:
  pip install gradio_client

Ausführen:
  1. npx tsx scripts/extract_dialogs.ts     (erzeugt scripts/dialogs.json)
  2. python scripts/generate_audio.py        (erzeugt public/game/audio/*)
"""

import json
import os
import shutil
import time
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Konfiguration
# ─────────────────────────────────────────────────────────────────────────────

DIALOGS_JSON    = Path(__file__).parent / "dialogs.json"
OUTPUT_DIR      = Path(__file__).parent.parent / "public" / "game" / "audio"
MANIFEST_PATH   = OUTPUT_DIR / "manifest.json"

# Qwen3-TTS HuggingFace Space
TTS_SPACE = "Qwen/Qwen3-TTS"

# Pause zwischen API-Aufrufen (Rate-Limit vermeiden)
API_DELAY_SEC = 1.5

# ─────────────────────────────────────────────────────────────────────────────
# Charakter → Stimme + Stil
# Verfügbare Sprecher: Aiden, Dylan, Eric, Ono_anna, Ryan, Serena, Sohee, Uncle_fu, Vivian
# ─────────────────────────────────────────────────────────────────────────────

VOICE_MAP: dict[str, tuple[str, str]] = {
    "Inspector Node": (
        "Ryan",
        "Speak slowly and with calm authority, like a wise detective mentor guiding a young apprentice. "
        "Deep, measured, slightly formal. Very clear pronunciation."
    ),
    "{NAME}": (
        "Dylan",
        "Speak curiously and enthusiastically, like a motivated young person experiencing something exciting. "
        "Light, energetic, natural pace."
    ),
    "Viktor": (
        "Aiden",
        "Speak nervously and defensively, like someone trying to convince others of their innocence. "
        "Slightly higher pitch under pressure."
    ),
    # Weibliche Verdächtige
    "Rosa R.":   ("Serena",   "Speak calmly and matter-of-factly, like a friendly bookshop worker."),
    "Lisa L.":   ("Vivian",   "Speak naturally, like a student — curious and open."),
    "Erna E.":   ("Ono_anna", "Speak gently and a bit formally, like an older woman."),
    # Männliche Verdächtige
    "Otto O.":   ("Eric",     "Speak in a gruff, slightly suspicious tone, like someone with something to hide."),
    "Max M.":    ("Uncle_fu", "Speak loudly and conspicuously, like someone overdoing their innocence act."),
    "Bert B.":   ("Aiden",    "Speak precisely and businesslike, like a salesman."),
    # Default
    "default":   ("Eric",     "Speak clearly and naturally in a neutral voice."),
}

# ─────────────────────────────────────────────────────────────────────────────
# djb2-Hash (muss identisch mit useTTS.ts sein)
# ─────────────────────────────────────────────────────────────────────────────

def djb2(text: str) -> str:
    h = 5381
    for ch in text:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    return format(h, '08x')


def get_voice(speaker: str) -> tuple[str, str]:
    """Gibt (speaker_name, instruct) für einen Charakter zurück."""
    if speaker in VOICE_MAP:
        return VOICE_MAP[speaker]
    # Heuristik: Sprecher mit {NAME} ist der Spieler
    if "{NAME}" in speaker or "Detektiv" in speaker:
        return VOICE_MAP["{NAME}"]
    return VOICE_MAP["default"]


# ─────────────────────────────────────────────────────────────────────────────
# Hauptprogramm
# ─────────────────────────────────────────────────────────────────────────────

def main():
    # gradio_client importieren (zeigt klare Fehlermeldung wenn nicht installiert)
    try:
        from gradio_client import Client
    except ImportError:
        print("❌ gradio_client nicht installiert.")
        print("   Bitte ausführen: pip install gradio_client")
        return

    # dialogs.json lesen
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

    # Bestehende Manifest laden (für Resume)
    manifest: dict[str, str] = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, encoding="utf-8") as f:
            manifest = json.load(f)
        print(f"📁 Bestehendes Manifest geladen: {len(manifest)} Einträge")

    # API-Client initialisieren
    print(f"\n🔗 Verbinde mit {TTS_SPACE}...")
    try:
        client = Client(TTS_SPACE)
        print("✓ Verbunden")
    except Exception as e:
        print(f"❌ Verbindung fehlgeschlagen: {e}")
        return

    # Für jeden einzigartigen Dialog-Eintrag Audio generieren
    generated = 0
    skipped = 0
    errors = 0

    for i, entry in enumerate(unique_entries):
        text: str = entry["text"]
        speaker: str = entry["speaker"]
        entry_id: str = entry["id"]

        # Platzhalter ersetzen für TTS
        tts_text = text.replace("{NAME}", "der Detektiv")

        # Hash für Dateiname
        text_hash = djb2(tts_text)
        manifest_key = f"{text_hash}_{djb2(speaker)}"

        # Level-Unterordner
        level_num = entry.get("level", 0)
        level_dir = OUTPUT_DIR / f"level{level_num}"
        level_dir.mkdir(exist_ok=True)

        # Zieldatei
        out_file = level_dir / f"{entry_id}.wav"
        rel_path = f"/game/audio/level{level_num}/{entry_id}.wav"

        # Bereits generiert?
        if manifest_key in manifest and out_file.exists():
            skipped += 1
            print(f"  ⏭  [{i+1}/{len(unique_entries)}] Übersprungen: {entry_id}")
            continue

        # Stimme bestimmen
        tts_speaker, instruct = get_voice(speaker)

        print(f"  🎙  [{i+1}/{len(unique_entries)}] {speaker} ({tts_speaker}): {tts_text[:60]}...")

        try:
            result = client.predict(
                text=tts_text,
                language="German",
                speaker=tts_speaker,
                instruct=instruct,
                model_size="1.7B",
                api_name="/generate_custom_voice",
            )

            # result[0] ist der filepath der generierten Audiodatei
            src_file = result[0] if isinstance(result, (list, tuple)) else result
            if src_file and os.path.exists(src_file):
                shutil.copy2(src_file, out_file)
                manifest[manifest_key] = rel_path
                generated += 1
                print(f"     ✓ Gespeichert: {out_file.name}")
            else:
                print(f"     ⚠ Keine Ausgabedatei: {result}")
                errors += 1

        except Exception as e:
            print(f"     ❌ Fehler: {e}")
            errors += 1

        # Manifest nach jedem Eintrag aktualisieren (Resume bei Abbruch)
        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        # Rate-Limit
        if i < len(unique_entries) - 1:
            time.sleep(API_DELAY_SEC)

    # Abschlussbericht
    print(f"\n{'='*50}")
    print(f"✅ Fertig!")
    print(f"   Generiert: {generated}")
    print(f"   Übersprungen: {skipped}")
    print(f"   Fehler: {errors}")
    print(f"   Manifest: {MANIFEST_PATH}")
    print(f"\nNächster Schritt:")
    print(f"   git add public/game/audio/ && git commit -m 'feat: Qwen3-TTS Audiodateien'")
    print(f"   git push origin main")


if __name__ == "__main__":
    main()

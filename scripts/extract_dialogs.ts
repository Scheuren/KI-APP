/**
 * extract_dialogs.ts
 * Extrahiert alle DialogLine-Arrays aus den Level-Datendateien
 * und schreibt sie als JSON nach scripts/dialogs.json
 *
 * Ausführen: npx tsx scripts/extract_dialogs.ts
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

import {
  introDialogues,
  monitorDialogues,
  teachingDialogues,
} from '../src/lib/game/level1Data'

import {
  introDialogues2,
  teachingDialogues2,
} from '../src/lib/game/level2Data'

import {
  introDialogues3,
  teachingDialogues3,
} from '../src/lib/game/level3Data'

import {
  introDialogues4,
  teachingDialogues4,
} from '../src/lib/game/level4Data'

import {
  introDialogues5,
  teachingDialogues5,
  faceRecogBiasDialogue,
  finalSpeechDialogues,
} from '../src/lib/game/level5Data'

// ─── Typ ───────────────────────────────────────────────────────────────────

type DialogEntry = {
  id: string         // z.B. "level1_intro_0"
  speaker: string    // "Inspector Node" | "{NAME}" | ...
  text: string       // Originaltext (mit {NAME}-Platzhalter)
  level: number
  arrayName: string
  lineIndex: number
}

// ─── Alle Dialoge zusammenstellen ─────────────────────────────────────────

const allDialogs: Array<{ name: string; level: number; lines: { speaker: string; text: string }[] }> = [
  { name: 'intro',           level: 1, lines: introDialogues },
  { name: 'monitor',         level: 1, lines: monitorDialogues },
  { name: 'teaching',        level: 1, lines: teachingDialogues },

  { name: 'intro',           level: 2, lines: introDialogues2 },
  { name: 'teaching',        level: 2, lines: teachingDialogues2 },

  { name: 'intro',           level: 3, lines: introDialogues3 },
  { name: 'teaching',        level: 3, lines: teachingDialogues3 },

  { name: 'intro',           level: 4, lines: introDialogues4 },
  { name: 'teaching',        level: 4, lines: teachingDialogues4 },

  { name: 'intro',           level: 5, lines: introDialogues5 },
  { name: 'teaching',        level: 5, lines: teachingDialogues5 },
  { name: 'face_recog',      level: 5, lines: faceRecogBiasDialogue },
  { name: 'final_speech',    level: 5, lines: finalSpeechDialogues },
]

const entries: DialogEntry[] = []

for (const dialog of allDialogs) {
  for (let i = 0; i < dialog.lines.length; i++) {
    const line = dialog.lines[i]
    entries.push({
      id: `level${dialog.level}_${dialog.name}_${String(i).padStart(3, '0')}`,
      speaker: line.speaker,
      text: line.text,
      level: dialog.level,
      arrayName: dialog.name,
      lineIndex: i,
    })
  }
}

// Deduplizieren: gleicher Text + gleicher Sprecher → nur einmal generieren
const seen = new Map<string, DialogEntry>()
for (const entry of entries) {
  const key = `${entry.speaker}|||${entry.text}`
  if (!seen.has(key)) seen.set(key, entry)
}

const unique = Array.from(seen.values())

console.log(`Gesamt: ${entries.length} Zeilen, davon ${unique.length} einzigartig`)

// ─── Ausgabe schreiben ────────────────────────────────────────────────────

const outPath = join(process.cwd(), 'scripts', 'dialogs.json')
writeFileSync(outPath, JSON.stringify({ entries, unique }, null, 2), 'utf-8')
console.log(`✓ Gespeichert: ${outPath}`)
console.log('\nNächster Schritt:')
console.log('  pip install gradio_client')
console.log('  python scripts/generate_audio.py')

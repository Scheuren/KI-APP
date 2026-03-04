#!/usr/bin/env node
/**
 * Team ?³ — Image Generation Agent
 *
 * Nutzt Together.ai FLUX.1-schnell-Free (komplett kostenlos, nur Account nötig).
 * Generiert PNG-Bilder im animated-movie / cartoon style.
 *
 * Setup:
 *   1. Konto auf https://together.ai erstellen (kostenlos)
 *   2. API Key holen: https://api.together.xyz/settings/api-keys
 *   3. Ausführen:
 *      TOGETHER_API_KEY=... npx tsx scripts/image-agent.ts
 *      TOGETHER_API_KEY=... npx tsx scripts/image-agent.ts --only characters
 *      TOGETHER_API_KEY=... npx tsx scripts/image-agent.ts --id agent-x-idle
 *      TOGETHER_API_KEY=... npx tsx scripts/image-agent.ts --force
 */

import fs from 'fs/promises'
import path from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'game')
const MODEL      = 'black-forest-labs/FLUX.1-schnell' // serverless, ~$0.003/Bild
const DELAY_MS   = 1500 // kurze Pause zwischen Requests

// Stil-Basis für alle Charaktere
const CHAR_STYLE = [
  'animated movie character illustration',
  'DreamWorks animation style',
  'full body character design',
  'vibrant colors',
  'expressive cartoon face',
  'clean solid color background',
  'high quality digital art',
  '2D game sprite art',
  'detailed character art',
].join(', ')

const BG_STYLE = [
  'detailed interior scene',
  'animated movie background art',
  'DreamWorks style environment',
  'warm lighting',
  'vibrant colors',
  'cartoon illustration',
  'game background art',
  'wide panoramic view',
  'no characters',
].join(', ')

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ImageDef = {
  id:     string
  folder: 'characters' | 'backgrounds'
  width:  number
  height: number
  prompt: string
}

type TogetherResponse = {
  data?: { b64_json?: string; url?: string }[]
  error?: { message: string }
}

// ─────────────────────────────────────────────────────────────────────────────
// Character definitions
// ─────────────────────────────────────────────────────────────────────────────

const CHARACTERS: ImageDef[] = [
  {
    id: 'agent-x-idle',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Young teenage detective "Agent X", gender-neutral, about 14 years old. Wearing an oversized bright yellow trenchcoat with collar flipped up and 3 dark buttons, dark navy jeans, white sneakers with yellow laces. Bright yellow wide-brim fedora hat with dark band. Friendly round face, large expressive brown eyes, short messy brown hair. Holding a magnifying glass with golden handle in right hand. Relaxed confident idle stance facing forward. Cream white background. Full body visible head to toe.`,
  },
  {
    id: 'agent-x-walk',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Young teenage detective "Agent X", gender-neutral, 14 years old. Wearing bright yellow trenchcoat, yellow fedora hat, dark navy jeans, white sneakers. Dynamic walking pose mid-stride, left leg forward right leg back, arms swinging, body leaning slightly forward, determined expression with focused eyes. Cream white background. Full body visible.`,
  },
  {
    id: 'agent-x-talk',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Young teenage detective "Agent X", gender-neutral, 14 years old. Wearing bright yellow trenchcoat, yellow fedora hat, dark navy jeans, white sneakers. Eureka pose: right arm raised high with index finger pointing up, left hand on hip, big open-mouth excited smile, wide eyes, slight body tilt. Cream white background. Full body visible.`,
  },
  {
    id: 'inspector-node',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Friendly older male detective mentor "Inspector Node", about 55 years old. Large bushy grey eyebrows, full thick grey moustache slightly curled at ends, round gold-frame reading glasses. Wearing brown tweed detective coat with leather elbow patches, brown waistcoat with pocket watch chain. Slightly chubby jolly build. Curved wooden pipe in mouth. Warm grandfatherly welcoming expression, hands clasped warmly. Warm sepia cream background. Full body visible.`,
  },
  {
    id: 'suspect-gustav',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Nervous shifty-looking male suspect "Gustav G.", about 40 years old. Wide-brim dark grey hat pulled very low casting shadow on upper face. Long grey overcoat with collar turned all the way up hiding lower face. Only narrow nervous eyes visible, thin wiry moustache, small sweat drops on temple. Hunched shoulders, hands in pockets, pigeon-toed nervous stance. Moody dark blue background. Full body visible.`,
  },
  {
    id: 'suspect-maria',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Confident intellectual woman suspect "Maria M.", about 35 years old. Large stylish square-frame blue glasses. Elegant dark teal business coat with sharp lapels, white blouse underneath. Black leather briefcase in left hand. Perfect posture, chin slightly raised, angular face with sharp cheekbones, sleek dark hair in a chignon bun. Slight knowing smile with one eyebrow raised. Dark blue background. Full body visible.`,
  },
  {
    id: 'suspect-boris',
    folder: 'characters',
    width: 512, height: 768,
    prompt: `${CHAR_STYLE}. Stocky grumpy male suspect "Boris B.", about 45 years old. Dark brown flat cap, very large bushy dark beard covering most of lower face and neck. Dark denim jacket over red-green flannel shirt. Very stocky muscular build, wide shoulders. Arms crossed tightly across chest. Deep scowl with heavy furrowed brows, extremely unimpressed expression. Thick neck, sturdy legs, heavy work boots. Dark blue background. Full body visible.`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Icon definitions (interaction zone objects)
// ─────────────────────────────────────────────────────────────────────────────

const ICON_STYLE = [
  'cartoon icon illustration',
  'DreamWorks animation style',
  'vibrant colors',
  'bold black outlines',
  'isolated object on white background',
  'square composition',
  'game UI icon',
  'high quality digital art',
].join(', ')

export const ICONS: ImageDef[] = [
  {
    id: 'icon-monitor',
    folder: 'icons' as 'characters',
    width: 256, height: 256,
    prompt: `${ICON_STYLE}. A retro vintage detective office computer monitor/TV screen. Warm amber glow from the screen, showing a play button symbol. Chunky CRT-style monitor, dark case. Cozy detective office atmosphere. White background.`,
  },
  {
    id: 'icon-caseboard',
    folder: 'icons' as 'characters',
    width: 256, height: 256,
    prompt: `${ICON_STYLE}. A detective cork investigation board. Cork board texture, red string connecting suspect photo cards, colorful push pins, yellow sticky notes, a magnifying glass leaning against it. Warm orange-brown colors. White background.`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Background definitions
// ─────────────────────────────────────────────────────────────────────────────

const BACKGROUNDS: ImageDef[] = [
  {
    id: 'detective-office',
    folder: 'backgrounds',
    width: 1024, height: 576,
    prompt: `${BG_STYLE}. Wide panoramic detective office interior. Left: large window showing rainy night city skyline, dark blue sky with lit buildings, bookshelf with colorful books. Center: large wooden desk with brass lamp casting warm yellow light cone, papers and folders. Right: large cork board on wall with red string connecting 3 suspect photos, yellow sticky notes, city map pinned up, filing cabinet. Warm hardwood floor, cream walls, amber lighting atmosphere. No people or characters.`,
  },
  {
    id: 'interrogation-room',
    folder: 'backgrounds',
    width: 1024, height: 576,
    prompt: `${BG_STYLE}. Wide panoramic police interrogation room interior. Dark concrete walls with texture. Single overhead industrial metal lamp hanging from ceiling casting dramatic bright yellow cone of light downward. Steel table directly under light, two plain metal chairs one on each side. One-way mirror on right wall. Dark grey concrete floor. Dramatic noir shadows, most of room in deep shadow, only center lit. Cool blue-grey color scheme with warm lamp light in center. No people or characters.`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Together.ai API
// ─────────────────────────────────────────────────────────────────────────────

async function generateImage(apiKey: string, def: ImageDef): Promise<Buffer> {
  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:           MODEL,
      prompt:          def.prompt,
      width:           def.width,
      height:          def.height,
      steps:           4,
      n:               1,
      response_format: 'b64_json',
    }),
    signal: AbortSignal.timeout(60_000),
  })

  const json = await res.json() as TogetherResponse

  if (!res.ok || json.error) {
    throw new Error(`Together API ${res.status}: ${json.error?.message ?? JSON.stringify(json).slice(0, 200)}`)
  }

  const b64 = json.data?.[0]?.b64_json
  if (!b64) {
    // Fallback: URL statt b64
    const url = json.data?.[0]?.url
    if (url) {
      const imgRes = await fetch(url)
      const buf = await imgRes.arrayBuffer()
      return Buffer.from(buf)
    }
    throw new Error(`Kein Bild in Antwort: ${JSON.stringify(json).slice(0, 300)}`)
  }

  return Buffer.from(b64, 'base64')
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true } catch { return false }
}

function log(msg: string) { process.stdout.write(msg + '\n') }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// ─────────────────────────────────────────────────────────────────────────────
// Core: generate + save one image
// ─────────────────────────────────────────────────────────────────────────────

async function generateAndSave(apiKey: string, def: ImageDef, force: boolean, idx: number) {
  const dir = path.join(OUTPUT_DIR, def.folder)
  await fs.mkdir(dir, { recursive: true })
  const outPath = path.join(dir, `${def.id}.png`)

  if (!force && await fileExists(outPath)) {
    log(`  ✓ skip   ${def.id}.png  (vorhanden, --force zum Überschreiben)`)
    return
  }

  if (idx > 0) await sleep(DELAY_MS)

  log(`  ⟳ gen    ${def.id}  [${def.width}×${def.height}]`)

  const buf = await generateImage(apiKey, def)
  await fs.writeFile(outPath, buf)
  log(`  ✅ saved  ${outPath}  (${(buf.length / 1024).toFixed(0)} KB)`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2)
  const force   = args.includes('--force')
  const onlyArg = args.find((_, i) => args[i - 1] === '--only')
  const idArg   = args.find((_, i) => args[i - 1] === '--id')

  log('🕵️  Team ?³ — Image Agent (Together.ai · FLUX.1-schnell-Free)')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log(`   Output: ${OUTPUT_DIR}`)
  log(`   Modell: ${MODEL}`)
  if (force)   log('   Mode:   force overwrite')
  if (onlyArg) log(`   Filter: nur "${onlyArg}"`)
  if (idArg)   log(`   Single: "${idArg}"`)

  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) {
    log('\n❌  TOGETHER_API_KEY ist nicht gesetzt.')
    log('   → Konto erstellen: https://together.ai (kostenlos)')
    log('   → API Key holen:   https://api.together.xyz/settings/api-keys')
    log('   → Dann ausführen:')
    log('      TOGETHER_API_KEY=your_key_here npx tsx scripts/image-agent.ts')
    process.exit(1)
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  let chars = CHARACTERS
  let bgs   = BACKGROUNDS

  let icons = ICONS

  if (idArg) {
    chars = CHARACTERS.filter(c => c.id === idArg)
    bgs   = BACKGROUNDS.filter(b => b.id === idArg)
    icons = ICONS.filter(i => i.id === idArg)
  } else if (onlyArg === 'characters') {
    bgs = []; icons = []
  } else if (onlyArg === 'backgrounds') {
    chars = []; icons = []
  } else if (onlyArg === 'icons') {
    chars = []; bgs = []
  }

  let idx = 0

  if (chars.length) {
    log(`\n👤 Charaktere (${chars.length}) — FLUX.1 generiert PNG...`)
    for (const def of chars) {
      await generateAndSave(apiKey, def, force, idx++)
    }
  }

  if (bgs.length) {
    log(`\n🏢 Hintergründe (${bgs.length}) — FLUX.1 generiert PNG...`)
    for (const def of bgs) {
      await generateAndSave(apiKey, def, force, idx++)
    }
  }

  if (icons.length) {
    log(`\n🎯 Icons (${icons.length}) — FLUX.1 generiert PNG...`)
    for (const def of icons) {
      await generateAndSave(apiKey, def, force, idx++)
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log('✅ Fertig! PNGs gespeichert in public/game/')
  log('   • public/game/characters/*.png')
  log('   • public/game/backgrounds/*.png')
  log('\n⚠️  Komponenten noch auf .svg — führe danach aus:')
  log('   npm run update-sprites')
}

main().catch(err => {
  console.error('\n❌ Fehler:', err.message ?? err)
  process.exit(1)
})

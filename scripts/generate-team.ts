import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const API_KEY = process.env.TOGETHER_API_KEY || '150e5ad21226801297f09b1ae021df484eec4586ada748917e9db15773652574'
const API_URL = 'https://api.together.xyz/v1/images/generations'
const OUTPUT_DIR = 'c:/Users/msche/Documents/claude/code/my-project/public/game/characters/preview'

// Style base: close to the example image — semi-realistic teen comic style, NOT chibi
const STYLE = [
  'teenage adventure comic book illustration',
  'semi-realistic cartoon character design',
  'vibrant colors with clean bold black outlines',
  'defined facial features',
  'NOT chibi NOT super-deformed NOT cute',
  'tall slim realistic teenage body proportions',
  'full body character visible head to toe',
  'pure white background',
  'high quality detailed illustration',
  'graphic novel art style',
].join(', ')

const characters = [
  {
    filename: 'tim-leader.png',
    prompt: `${STYLE}. Confident teenage boy "Tim" age 17, the leader of a detective team. Tall athletic build, slightly tousled dark black hair, sharp determined brown eyes, defined jawline. Wearing a dark navy zip-up hoodie with rolled-up sleeves, slim black jeans, white low-top sneakers. Holding a smartphone in one hand, small backpack on back. Heroic confident stance, slight smirk, one hand in pocket. Full body from head to shoes.`,
  },
  {
    filename: 'karl-brains.png',
    prompt: `${STYLE}. Intellectual teenage boy "Karl" age 16, the brains of a detective team. Slim lanky build, neatly combed short brown hair, round thick-framed glasses, thoughtful sharp eyes, slight knowing smile. Wearing a dark forest green cardigan over a light beige collared shirt, khaki trousers, brown oxford shoes. Carrying a worn leather satchel/messenger bag overflowing with maps, books and papers. Slightly tilted head, curious focused expression. Full body from head to shoes.`,
  },
  {
    filename: 'willi-hacker.png',
    prompt: `${STYLE}. Energetic teenage boy "Willi" age 16, the tech hacker of a detective team. Medium athletic build, wild spiky blonde hair, bright green eyes, wide mischievous grin, freckles on cheeks. Wearing a black-and-yellow striped open vest over a white graphic t-shirt, dark cargo shorts with pockets, yellow high-top sneakers. Holding a laptop covered in stickers under one arm, other arm in the air fist-pumping. Dynamic energetic pose leaning forward. Full body from head to shoes.`,
  },
  {
    filename: 'gaby-social.png',
    prompt: `${STYLE}. Friendly teenage girl "Gaby" age 16, the social specialist and animal lover of a detective team. Slim build, curly medium-length chestnut brown hair, warm expressive amber eyes, bright open smile. Wearing an olive green field jacket over a white shirt, dark blue jeans, brown ankle boots. A small Jack Russell terrier dog sitting loyally at her feet looking up at her. Open welcoming stance, one hand reaching down to pet the dog. Full body from head to shoes.`,
  },
]

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// Flood-fill white background removal (same algorithm as remove-bg.ts)
function removeWhiteBg(data: Uint8ClampedArray, width: number, height: number, threshold = 230) {
  const visited = new Uint8Array(width * height)
  const queue: number[] = []

  const addSeed = (x: number, y: number) => {
    const i4 = (y * width + x) * 4
    const r = data[i4], g = data[i4+1], b = data[i4+2]
    const max = Math.max(r,g,b), min = Math.min(r,g,b)
    const sat = max === 0 ? 0 : (max-min)/max
    if ((r>threshold && g>threshold && b>threshold) || sat<0.12) {
      const i = y*width+x
      if (!visited[i]) { visited[i]=1; queue.push(i) }
    }
  }
  for (let x=0; x<width; x++) { addSeed(x,0); addSeed(x,height-1) }
  for (let y=0; y<height; y++) { addSeed(0,y); addSeed(width-1,y) }

  const dirs = [-1,1,-width,width]
  while (queue.length > 0) {
    const i = queue.pop()!
    data[i*4+3] = 0
    for (const d of dirs) {
      const ni = i+d
      if (ni<0 || ni>=width*height) continue
      if (visited[ni]) continue
      if (Math.abs((i%width)-(ni%width)) > 1) continue
      const ni4 = ni*4
      const r=data[ni4], g=data[ni4+1], b=data[ni4+2]
      const max=Math.max(r,g,b), min=Math.min(r,g,b)
      const sat = max===0 ? 0 : (max-min)/max
      if ((r>threshold && g>threshold && b>threshold) || sat<0.12) {
        visited[ni]=1; queue.push(ni)
      }
    }
  }
  // Soft edge cleanup
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const i4=(y*width+x)*4
      if (data[i4+3]===0) continue
      const neighbors=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]]
      let hasTransparent=false
      for (const [nx,ny] of neighbors) {
        if (nx<0||nx>=width||ny<0||ny>=height) continue
        if (data[(ny*width+nx)*4+3]===0) { hasTransparent=true; break }
      }
      if (hasTransparent) {
        const whiteness = Math.min(data[i4],data[i4+1],data[i4+2])/255
        if (whiteness>0.8) data[i4+3]=Math.round(data[i4+3]*(1-whiteness*0.7))
      }
    }
  }
}

async function generateAndProcess(char: typeof characters[0], idx: number) {
  console.log(`\n[${idx+1}/4] Generating ${char.filename}...`)

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: char.prompt,
      width: 512, height: 768,
      steps: 4, n: 1,
      response_format: 'b64_json',
    }),
    signal: AbortSignal.timeout(60_000),
  })

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  const json = await res.json() as { data: Array<{ b64_json: string }> }
  const buf = Buffer.from(json.data[0].b64_json, 'base64')

  // Remove white background immediately
  console.log(`  Removing background...`)
  const img = sharp(buf)
  const { width, height } = await img.metadata()
  if (!width || !height) throw new Error('Could not read dimensions')
  const { data: rawData } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = new Uint8ClampedArray(rawData.buffer)
  removeWhiteBg(pixels, width, height)

  const outPath = path.join(OUTPUT_DIR, char.filename)
  await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels: 4 } }).png().toFile(outPath)
  const size = fs.statSync(outPath).size
  console.log(`  ✓ Saved transparent PNG: ${(size/1024).toFixed(1)} KB`)
}

async function main() {
  console.log('Team ?³ — Character Generator (semi-realistic style + auto background removal)')
  console.log('═══════════════════════════════════════════════════════════════════════════')
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  for (let i = 0; i < characters.length; i++) {
    try {
      await generateAndProcess(characters[i], i)
    } catch (e) {
      console.error(`  ERROR: ${e}`)
    }
    if (i < characters.length - 1) { console.log('  Waiting 1.5s...'); await sleep(1500) }
  }
  console.log('\n✅ Done — transparent PNGs in public/game/characters/preview/')
}

main().catch(e => { console.error(e); process.exit(1) })

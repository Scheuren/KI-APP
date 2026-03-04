import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const FILES = [
  'public/game/characters/agent-x-idle.png',
  'public/game/characters/agent-x-walk.png',
  'public/game/characters/agent-x-talk.png',
  'public/game/characters/inspector-node.png',
  'public/game/characters/suspect-gustav.png',
  'public/game/characters/suspect-maria.png',
  'public/game/characters/suspect-boris.png',
  'public/game/icons/icon-monitor.png',
  'public/game/icons/icon-caseboard.png',
]

const PROJECT_ROOT = path.resolve(__dirname, '..')

function floodFillRemoveBg(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 230
) {
  const visited = new Uint8Array(width * height)
  const queue: number[] = []

  const addSeed = (x: number, y: number) => {
    const idx4 = (y * width + x) * 4
    const r = data[idx4], g = data[idx4 + 1], b = data[idx4 + 2]
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    if ((r > threshold && g > threshold && b > threshold) || saturation < 0.12) {
      const idx = y * width + x
      if (!visited[idx]) {
        visited[idx] = 1
        queue.push(idx)
      }
    }
  }

  // Seed all 4 edges
  for (let x = 0; x < width; x++) {
    addSeed(x, 0)
    addSeed(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    addSeed(0, y)
    addSeed(width - 1, y)
  }

  // BFS flood fill
  const dirs = [-1, 1, -width, width]
  while (queue.length > 0) {
    const idx = queue.pop()!
    data[idx * 4 + 3] = 0 // set alpha to 0 (transparent)

    for (const d of dirs) {
      const nIdx = idx + d
      if (nIdx < 0 || nIdx >= width * height) continue
      if (visited[nIdx]) continue

      // Check bounds to avoid row-wrapping artifacts on left/right edges
      const cx = idx % width
      const nx = nIdx % width
      if (Math.abs(cx - nx) > 1) continue // skip wrap-around neighbors

      const nIdx4 = nIdx * 4
      const r = data[nIdx4], g = data[nIdx4 + 1], b = data[nIdx4 + 2]
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      if ((r > threshold && g > threshold && b > threshold) || saturation < 0.12) {
        visited[nIdx] = 1
        queue.push(nIdx)
      }
    }
  }
}

function softEdges(data: Uint8ClampedArray, width: number, height: number) {
  // For non-transparent pixels adjacent to transparent ones, gently reduce
  // alpha based on how white/near-white they are (anti-aliasing fringe cleanup)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x)
      const idx4 = idx * 4
      if (data[idx4 + 3] === 0) continue // already transparent

      // Check if any neighbor is transparent
      let hasTransparentNeighbor = false
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
      ]
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const nIdx4 = (ny * width + nx) * 4
        if (data[nIdx4 + 3] === 0) {
          hasTransparentNeighbor = true
          break
        }
      }

      if (hasTransparentNeighbor) {
        const r = data[idx4], g = data[idx4 + 1], b = data[idx4 + 2]
        // Whiteness score: how close to pure white
        const whiteness = Math.min(r, g, b) / 255
        if (whiteness > 0.8) {
          // Reduce alpha proportionally for near-white fringe pixels
          data[idx4 + 3] = Math.round(data[idx4 + 3] * (1 - whiteness * 0.7))
        }
      }
    }
  }
}

async function processFile(relativePath: string): Promise<void> {
  const filePath = path.join(PROJECT_ROOT, relativePath)
  const originalSize = fs.statSync(filePath).size

  // Load as raw RGBA
  const image = sharp(filePath)
  const { width, height } = await image.metadata()

  if (!width || !height) {
    console.error(`  [ERROR] Could not read dimensions for ${relativePath}`)
    return
  }

  const { data: rawData } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const data = new Uint8ClampedArray(rawData.buffer)

  // Step 1: Flood fill from edges to remove background
  floodFillRemoveBg(data, width, height)

  // Step 2: Soft edge cleanup for anti-aliasing fringe
  softEdges(data, width, height)

  // Write back as PNG with alpha
  await sharp(Buffer.from(data.buffer), {
    raw: { width, height, channels: 4 }
  })
    .png()
    .toFile(filePath + '.tmp')

  // Replace original with processed version
  fs.renameSync(filePath + '.tmp', filePath)

  const newSize = fs.statSync(filePath).size
  const sizeDiff = newSize - originalSize
  const diffStr = sizeDiff >= 0 ? `+${sizeDiff}` : `${sizeDiff}`
  console.log(
    `  OK  ${relativePath}\n` +
    `       ${originalSize.toLocaleString()} bytes -> ${newSize.toLocaleString()} bytes (${diffStr} bytes)`
  )
}

async function main() {
  console.log('Background removal script starting...')
  console.log(`Project root: ${PROJECT_ROOT}`)
  console.log(`Processing ${FILES.length} files...\n`)

  for (const file of FILES) {
    try {
      await processFile(file)
    } catch (err) {
      console.error(`  [ERROR] ${file}: ${err}`)
    }
  }

  console.log('\nDone.')
}

main().catch(console.error)

import sharp from 'sharp'
import fs from 'fs'

const FILES = [
  'public/game/characters/preview/leader.png',
  'public/game/characters/preview/brain.png',
  'public/game/characters/preview/hacker.png',
  'public/game/characters/social.png',
]

function floodFillRemoveBg(data, width, height, threshold = 230) {
  const visited = new Uint8Array(width * height)
  const queue = []
  const addSeed = (x, y) => {
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
    const i = queue.pop()
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

async function main() {
  for (const file of FILES) {
    const img = sharp(file)
    const { width, height } = await img.metadata()
    if (!width || !height) { console.error('No dims:', file); continue }
    const { data: raw } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const pixels = new Uint8ClampedArray(raw.buffer)
    floodFillRemoveBg(pixels, width, height)
    await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels: 4 } }).png().toFile(file + '.tmp')
    fs.renameSync(file + '.tmp', file)
    const size = fs.statSync(file).size
    console.log(`OK  ${file}  (${(size/1024).toFixed(0)} KB)`)
  }
  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })

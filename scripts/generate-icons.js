// Genera los PNG de la PWA a partir de public/favicon.svg. Correr una vez: npm run icons
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url))
const BG = '#111015'
const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))

async function plain(size, name) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .flatten({ background: BG })
    .png()
    .toFile(out(name))
  console.log(name)
}

// Ícono maskable: el contenido debe quedar dentro del 80% central (zona segura)
async function maskable(size, name) {
  const inner = Math.round(size * 0.66)
  const icon = await sharp(svg, { density: 300 }).resize(inner, inner).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG }
  })
    .composite([{ input: icon, gravity: 'centre' }])
    .png()
    .toFile(out(name))
  console.log(name)
}

await plain(192, 'pwa-192x192.png')
await plain(512, 'pwa-512x512.png')
await plain(180, 'apple-touch-icon.png')
await maskable(512, 'pwa-maskable-512x512.png')

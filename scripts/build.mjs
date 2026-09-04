import { execSync } from 'node:child_process'
import { mkdirSync, cpSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')

// Run Vite build
console.log('==> Running vite build...')
execSync('npx vite build', { cwd: root, stdio: 'inherit' })

console.log('==> dist 就绪:', readdirSync(dist).join(', '))

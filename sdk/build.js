import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

const distDir = './dist'

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const commonConfig = {
  entryPoints: ['./index.js'],
  bundle: false,
  sourcemap: true,
  minify: true,
  external: ['socket.io-client', 'node-fetch'],
}

// Build CommonJS
await esbuild.build({
  ...commonConfig,
  outfile: './dist/index.js',
  format: 'cjs',
})

// Build ESM
await esbuild.build({
  ...commonConfig,
  outfile: './dist/index.esm.js',
  format: 'esm',
})

// Copy TypeScript definitions
fs.copyFileSync('./index.d.ts', './dist/index.d.ts')

// Copy README
fs.copyFileSync('./README.md', './dist/README.md')

console.log('✅ Build complete! Created dist/ folder with:')
console.log('   - dist/index.js (CommonJS)')
console.log('   - dist/index.esm.js (ESM)')
console.log('   - dist/index.d.ts (TypeScript definitions)')

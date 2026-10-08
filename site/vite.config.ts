// Vite build config for the TanStack Start app. Read by `npm run dev` / `npm run build`; copied from the Filix scaffold.
import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// nitro() wires the SSR build to a real hosting adapter (Vercel auto-detected).
// Without it `vite build` emits a bare server.js and every route 404s on Vercel.
// Do NOT add @tanstack/devtools-vite: it crashed the Filix dev server on Windows
// (see Filix filix-bugs.md).
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config

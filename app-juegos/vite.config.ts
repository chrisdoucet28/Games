import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel (the canonical domain, playclasscade.com) serves the app from the root, so asset
// references need to be root-absolute ("/assets/x.js") — a relative path ("assets/x.js") resolves
// against the current URL's path, which breaks on any nested route deeper than one segment (e.g.
// /learn/<topicId> resolves "assets/x.js" against "/learn/" instead of "/", 404ing the whole bundle
// and leaving a blank page). GitHub Pages, by contrast, serves this app from a repo subpath
// (no custom domain configured there), so it still needs the old relative base — set via
// VITE_BASE_PATH in .github/workflows/deploy-pages.yml. Vercel's build has no such env var, so it
// gets the safe default.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})

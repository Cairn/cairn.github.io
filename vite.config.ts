import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // esbuild's CSS minifier dedupes backdrop-filter/-webkit-backdrop-filter
    // pairs down to the prefixed one, which Chromium and Firefox ignore
    cssMinify: false,
  },
})

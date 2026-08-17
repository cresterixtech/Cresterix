import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Honour a harness/CI supplied port when present.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    // The three/postprocessing chunk is intentionally large and is
    // loaded lazily after first paint — the default warning is noise.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Keep the 3D stack out of the initial chunk so the opening
        // frame can paint before it arrives (§17, progressive loading).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/three|postprocessing/.test(id)) return 'three'
            if (/react-router/.test(id)) return 'router'
            if (/react|scheduler/.test(id)) return 'react'
            if (/lenis|gsap/.test(id)) return 'motion'
          }
        },
      },
    },
  },
})

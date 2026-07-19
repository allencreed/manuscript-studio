import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src/main/renderer',
  plugins: [react()],
  clearScreen: false,
  build: {
    rollupOptions: {
      input: 'src/main/renderer/index.html',
    },
    outDir: '../dist/renderer',
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: 'src/main/renderer',
  plugins: [react()],
  clearScreen: false,
  base: './',
  build: {
    rollupOptions: {
      input: 'src/main/renderer/index.html',
    },
    outDir: path.resolve(__dirname, 'dist/renderer'),
  },
})

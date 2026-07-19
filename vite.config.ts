import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/electron/main.ts',
      },
    ]),
    renderer(),
  ],
  clearScreen: false,
  base: './',
  build: {
    rollupOptions: {
      input: 'src/main/renderer/index.html',
    },
    outDir: path.resolve(__dirname, 'dist/renderer'),
  },
})

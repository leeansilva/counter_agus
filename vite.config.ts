import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localApiPlugin } from './viteApiPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 5173,
    strictPort: false
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})

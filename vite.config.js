import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public/output',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',                
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name][extname]',  
      },
    },
  },
})

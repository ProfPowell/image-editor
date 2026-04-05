import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'image-editor': 'src/image-editor.js',
        'image-convert': 'src/image-convert.js'
      },
      formats: ['es']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  server: {
    open: '/docs/index.html'
  }
})

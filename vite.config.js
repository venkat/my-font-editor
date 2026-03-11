import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        touchTest: 'touch-test.html'
      }
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});

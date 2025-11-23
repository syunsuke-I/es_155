import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false, // tscで生成した型定義を保持
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'AbcEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `abc-editor.${format}.js`,
    },
    rollupOptions: {
      // React, React-DOM, abcjsを外部依存として扱う
      external: ['react', 'react-dom', 'react/jsx-runtime', 'abcjs'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          abcjs: 'ABCJS',
        },
      },
    },
  },
})

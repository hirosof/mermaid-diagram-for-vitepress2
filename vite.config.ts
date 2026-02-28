import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        configuration: resolve(__dirname, 'src/configuration.ts'),
        exporter:resolve(__dirname,'src/exporter'),
        register:resolve(__dirname,'src/register')
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'vitepress',
        'mermaid',
        'shiki',
        /^node:/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
      },
    },
    target: 'esnext',
    minify: false,
  },
})

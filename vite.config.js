import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// ⚠️ IMPORTANTE: troque pelo SEU nome de usuário do GitHub e o nome do repositório
const NOME_USUARIO = 'SEU-USUARIO-AQUI'
const NOME_REPO = 'english-tutor'

export default defineConfig({
  plugins: [svelte()],
  base: `/${NOME_REPO}/`,
  build: {
    outDir: 'dist'
  }
})
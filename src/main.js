import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { popularBanco } from './lib/seed.js'

const app = mount(App, {
  target: document.getElementById('app'),
})

// Popula o banco na primeira execução
popularBanco();

export default app
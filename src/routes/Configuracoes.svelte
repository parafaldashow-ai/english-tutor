<script>
  import { onMount } from 'svelte';
  import { db } from '../lib/db.js';
  import { falar, carregarVozes, listarVozesIngles } from '../lib/tts.js';

  let vozes = [];
  let vozEscolhida = '';
  let velocidadeVoz = 0.9;
  let tema = 'claro';
  let mensagem = '';

  onMount(async () => {
    await carregarVozes();
    vozes = listarVozesIngles();

    const config = await db.settings.get('principal');
    if (config) {
      vozEscolhida = config.voiceName || '';
      velocidadeVoz = config.voiceRate || 0.9;
      tema = config.theme || 'claro';
    } else {
      vozEscolhida = vozes[0]?.name || '';
    }

    // Aplica o tema assim que a tela abre
    aplicarTema(tema);
  });

  // Sempre que "tema" mudar, aplica automaticamente
  $: if (typeof document !== 'undefined') {
    aplicarTema(tema);
  }

  function aplicarTema(novoTema) {
    if (typeof document === 'undefined') return;
    if (novoTema === 'escuro') {
      document.body.classList.add('escuro');
    } else {
      document.body.classList.remove('escuro');
    }
  }

  async function salvar() {
    const config = {
      id: 'principal',
      voiceName: vozEscolhida,
      voiceRate: velocidadeVoz,
      theme: tema
    };
    await db.settings.put(config);
    mostrarMensagem('✅ Configurações salvas!');
  }

  async function testarVoz() {
    falar('Hello! This is a test of my voice.', velocidadeVoz);
  }

  async function apagarTudo() {
    const confirmar = confirm(
      '⚠️ ATENÇÃO!\n\nIsso vai APAGAR TODAS as suas palavras e o progresso.\n\nTem certeza?'
    );

    if (confirmar) {
      const confirmar2 = confirm('Última chance! Tem CERTEZA que quer apagar tudo?');
      if (confirmar2) {
        await db.words.clear();
        await db.phrases.clear();
        await db.settings.clear();
        document.body.classList.remove('escuro');
        mostrarMensagem('🗑️ Todos os dados foram apagados. Recarregue a página.');
      }
    }
  }

  async function restaurarPadrao() {
    const confirmar = confirm('Restaurar as 20 palavras iniciais?');
    if (confirmar) {
      const { popularBanco } = await import('../lib/seed.js');
      await popularBanco();
      mostrarMensagem('✅ Palavras restauradas!');
    }
  }

  function mostrarMensagem(texto) {
    mensagem = texto;
    setTimeout(() => (mensagem = ''), 3000);
  }
</script>

<div class="container">
  <h2>⚙️ Configurações</h2>

  <div class="secao">
    <h3>🎙️ Voz</h3>

    <label class="campo">
      <span>Voz preferida</span>
      <select bind:value={vozEscolhida}>
        {#each vozes as voz}
          <option value={voz.name}>{voz.name} ({voz.lang})</option>
        {/each}
      </select>
    </label>

    <label class="campo">
      <span>Velocidade: {velocidadeVoz.toFixed(1)}x</span>
      <input type="range" min="0.5" max="1.5" step="0.1" bind:value={velocidadeVoz} />
    </label>

    <button class="botao-teste" on:click={testarVoz}>🔊 Testar voz</button>
  </div>

  <div class="secao">
    <h3>🎨 Aparência</h3>

    <label class="campo">
      <span>Tema</span>
      <select bind:value={tema}>
        <option value="claro">☀️ Claro</option>
        <option value="escuro">🌙 Escuro</option>
      </select>
    </label>
  </div>

  <div class="secao">
    <h3>💾 Dados</h3>

    <button class="botao-aviso" on:click={restaurarPadrao}>
      🔄 Restaurar palavras iniciais
    </button>

    <button class="botao-perigo" on:click={apagarTudo}>
      🗑️ Apagar TODOS os dados
    </button>
  </div>

  <div class="secao">
    <h3>ℹ️ Sobre</h3>
    <p class="sobre">
      <strong>English Tutor</strong><br>
      Versão 1.0<br>
      Professor de inglês offline com IA local<br><br>
      Desenvolvido com ❤️ usando Svelte, Dexie, Web Speech API e WebLLM.
    </p>
  </div>

  <button class="botao-salvar" on:click={salvar}>💾 Salvar configurações</button>

  {#if mensagem}
    <div class="mensagem">{mensagem}</div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    text-align: left;
  }

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .secao {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .secao h3 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    color: #6366f1;
  }

  .campo {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .campo span {
    font-size: 0.85rem;
    color: #666;
  }

  .campo select,
  .campo input[type="range"] {
    padding: 10px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
    background: white;
  }

  .campo select:focus {
    border-color: #6366f1;
  }

  .botao-teste {
    width: 100%;
    padding: 12px;
    background: #eef2ff;
    color: #3730a3;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .botao-teste:hover {
    background: #c7d2fe;
  }

  .botao-aviso {
    width: 100%;
    padding: 12px;
    background: #fffbeb;
    color: #78350f;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    cursor: pointer;
    margin-bottom: 10px;
  }

  .botao-aviso:hover {
    background: #fef3c7;
  }

  .botao-perigo {
    width: 100%;
    padding: 12px;
    background: #fef2f2;
    color: #991b1b;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .botao-perigo:hover {
    background: #fee2e2;
  }

  .sobre {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.6;
    margin: 0;
    text-align: center;
  }

  .botao-salvar {
    width: 100%;
    padding: 16px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
  }

  .botao-salvar:hover {
    background: #4f46e5;
  }

  .mensagem {
    text-align: center;
    padding: 12px;
    margin-top: 12px;
    background: #f0fdf4;
    color: #065f46;
    border-radius: 10px;
    font-size: 0.9rem;
  }
</style>
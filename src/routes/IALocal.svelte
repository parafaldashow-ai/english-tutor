<script>
  import { onMount } from 'svelte';
  import { suportaWebGPU, carregarModelo, gerarResposta, modeloEstaPronto } from '../lib/ia-local.js';
  import { falar } from '../lib/tts.js';

  let suportado = false;
  let carregando = false;
  let pronto = false;
  let progresso = '';
  let erro = null;
  let mensagens = [];
  let entrada = '';
  let pensando = false;

  onMount(() => {
    suportado = suportaWebGPU();
    pronto = modeloEstaPronto();
  });

  async function iniciar() {
    erro = null;
    carregando = true;
    progresso = 'Iniciando...';

    try {
      await carregarModelo((texto) => {
        progresso = texto;
      });
      pronto = true;
      mensagens = [{
        autor: 'ia',
        texto: 'Hello! I\'m your AI tutor. I can answer questions and chat with you in English. What would you like to talk about?'
      }];
    } catch (e) {
      erro = `Erro: ${e.message || e}. Pode ser que seu dispositivo não tenha memória suficiente.`;
    }

    carregando = false;
  }

  async function enviar() {
    const texto = entrada.trim();
    if (!texto || pensando) return;

    mensagens = [...mensagens, { autor: 'usuario', texto }];
    entrada = '';
    pensando = true;

    try {
      const historico = mensagens
        .slice(-6)
        .map(m => ({ role: m.autor === 'usuario' ? 'user' : 'assistant', content: m.texto }));

      const resposta = await gerarResposta(texto, historico);
      mensagens = [...mensagens, { autor: 'ia', texto: resposta }];
      falar(resposta);
    } catch (e) {
      mensagens = [...mensagens, { autor: 'ia', texto: `Erro: ${e.message}` }];
    }

    pensando = false;
  }
</script>

<div class="container">
  {#if !suportado}
    <div class="aviso-ruim">
      ⚠️ Seu navegador não suporta WebGPU. Esta tela não vai funcionar.
    </div>
  {:else if !pronto && !carregando}
    <div class="intro">
      <h2>🤖 IA Local com WebGPU</h2>
      <p>Este recurso roda uma <strong>IA de verdade</strong> dentro do seu navegador, sem internet.</p>

      <div class="detalhes">
        <div class="item">
          <span class="label">Modelo</span>
          <span class="valor">Qwen 2.5 0.5B</span>
        </div>
        <div class="item">
          <span class="label">Download</span>
          <span class="valor">~350 MB (só na 1ª vez)</span>
        </div>
        <div class="item">
          <span class="label">Armazenamento</span>
          <span class="valor">No navegador (cache)</span>
        </div>
      </div>

      <div class="aviso">
        ⚠️ <strong>Atenção:</strong> a primeira resposta pode demorar 10-30 segundos.
      </div>

      {#if erro}
        <div class="erro">{erro}</div>
      {/if}

      <button class="botao-iniciar" on:click={iniciar}>
        🚀 Baixar e iniciar IA
      </button>
    </div>

  {:else if carregando}
    <div class="loading">
      <h2>⏳ Carregando IA...</h2>
      <p class="progresso">{progresso}</p>
      <div class="spinner"></div>
      <p class="dica">Isso pode demorar alguns minutos na primeira vez.</p>
    </div>

  {:else if pronto}
    <div class="chat">
      <div class="header">
        <span>🤖 IA Local</span>
        <span class="status">● Online</span>
      </div>

      <div class="mensagens">
        {#each mensagens as msg}
          <div class="msg {msg.autor}">
            <div class="balao">{msg.texto}</div>
          </div>
        {/each}
        {#if pensando}
          <div class="msg ia">
            <div class="balao pensando">Pensando<span>.</span><span>.</span><span>.</span></div>
          </div>
        {/if}
      </div>

      <div class="input">
        <input
          type="text"
          bind:value={entrada}
          placeholder="Pergunte algo em inglês..."
          on:keydown={(e) => e.key === 'Enter' && enviar()}
          disabled={pensando}
        />
        <button on:click={enviar} disabled={!entrada.trim() || pensando}>➤</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .container { width: 100%; text-align: center; }

  .intro {
    background: var(--bg-card);
    color: var(--texto-principal);
    border-radius: 20px;
    padding: 30px 20px;
    box-shadow: 0 4px 20px var(--sombra);
  }

  .intro h2 { margin-top: 0; color: var(--texto-principal); }

  .intro p {
    color: var(--texto-secundario);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .detalhes {
    background: var(--bg-secundario);
    border-radius: 12px;
    padding: 12px 16px;
    margin: 16px 0;
    text-align: left;
  }

  .item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--borda);
    font-size: 0.9rem;
  }

  .item:last-child { border-bottom: none; }

  .label { color: var(--texto-secundario); }
  .valor { font-weight: 600; color: var(--texto-principal); }

  .aviso {
    background: #fffbeb;
    color: #78350f;
    padding: 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    text-align: left;
    margin-bottom: 16px;
  }

  .erro {
    background: #fef2f2;
    color: #991b1b;
    padding: 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    margin-bottom: 16px;
  }

  .botao-iniciar {
    width: 100%;
    padding: 16px;
    background: var(--roxo);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .botao-iniciar:hover { background: var(--roxo-escuro); }

  .loading {
    background: var(--bg-card);
    color: var(--texto-principal);
    border-radius: 20px;
    padding: 40px 20px;
    box-shadow: 0 4px 20px var(--sombra);
  }

  .loading h2 { color: var(--texto-principal); }

  .progresso {
    color: var(--roxo);
    font-size: 0.85rem;
    word-break: break-word;
    margin: 16px 0;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--borda);
    border-top-color: var(--roxo);
    border-radius: 50%;
    margin: 20px auto;
    animation: girar 1s linear infinite;
  }

  @keyframes girar { to { transform: rotate(360deg); } }

  .dica {
    color: var(--texto-terciario);
    font-size: 0.8rem;
    margin-top: 16px;
  }

  .chat {
    background: var(--bg-card);
    border-radius: 20px;
    box-shadow: 0 4px 20px var(--sombra);
    overflow: hidden;
    height: 70vh;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .header {
    background: var(--roxo);
    color: white;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    font-weight: 600;
  }

  .status { color: #a7f3d0; font-size: 0.85rem; }

  .mensagens {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-secundario);
  }

  .msg { display: flex; }

  .msg.usuario { justify-content: flex-end; }

  .balao {
    max-width: 75%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  /* Balão da IA: fundo do card, texto principal */
  .msg.ia .balao {
    background: var(--bg-card);
    color: var(--texto-principal);
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px var(--sombra);
  }

  /* Balão do usuário: fundo roxo, texto branco */
  .msg.usuario .balao {
    background: var(--roxo);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .pensando span { animation: piscar 1.4s infinite; }
  .pensando span:nth-child(2) { animation-delay: 0.2s; }
  .pensando span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes piscar {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }

  .input {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-card);
    border-top: 1px solid var(--borda);
  }

  .input input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid var(--borda);
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
    background: var(--bg-card);
    color: var(--texto-principal);
  }

  .input input::placeholder {
    color: var(--texto-terciario);
  }

  .input input:focus { border-color: var(--roxo); }

  .input button {
    padding: 0 16px;
    background: var(--roxo);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .input button:disabled {
    background: var(--borda-forte);
    color: var(--texto-terciario);
  }

  .aviso-ruim {
    background: #fef2f2;
    color: #991b1b;
    padding: 20px;
    border-radius: 12px;
    font-size: 0.95rem;
  }
</style>
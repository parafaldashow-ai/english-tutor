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
    background: white;
    border-radius: 20px;
    padding: 30px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .intro h2 { margin-top: 0; }

  .intro p {
    color: #555;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .detalhes {
    background: #f8fafc;
    border-radius: 12px;
    padding: 12px 16px;
    margin: 16px 0;
    text-align: left;
  }

  .item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.9rem;
  }

  .item:last-child { border-bottom: none; }

  .label { color: #666; }
  .valor { font-weight: 600; }

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
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .botao-iniciar:hover { background: #4f46e5; }

  .loading {
    background: white;
    border-radius: 20px;
    padding: 40px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .progresso {
    color: #6366f1;
    font-size: 0.85rem;
    word-break: break-word;
    margin: 16px 0;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    margin: 20px auto;
    animation: girar 1s linear infinite;
  }

  @keyframes girar { to { transform: rotate(360deg); } }

  .dica {
    color: #999;
    font-size: 0.8rem;
    margin-top: 16px;
  }

  .chat {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    overflow: hidden;
    height: 70vh;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .header {
    background: #6366f1;
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
    background: #f8fafc;
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

  .msg.ia .balao {
    background: white;
    border-bottom-left-radius: 4px;
  }

  .msg.usuario .balao {
    background: #6366f1;
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
    background: white;
    border-top: 1px solid #e2e8f0;
  }

  .input input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
  }

  .input input:focus { border-color: #6366f1; }

  .input button {
    padding: 0 16px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .input button:disabled { background: #cbd5e1; }

  .aviso-ruim {
    background: #fef2f2;
    color: #991b1b;
    padding: 20px;
    border-radius: 12px;
    font-size: 0.95rem;
  }
</style>
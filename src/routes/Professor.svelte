<script>
  import { onMount } from 'svelte';
  import { falar, carregarVozes } from '../lib/tts.js';
  import { responder, SUGESTOES_INICIAIS } from '../lib/professor.js';

  let mensagens = [];
  let entrada = '';
  let digitando = false;

  onMount(async () => {
    await carregarVozes();
    mensagens = [
      {
        autor: 'professor',
        texto: 'Hello! I\'m your English tutor. Let\'s practice! What would you like to talk about?'
      }
    ];
  });

  async function enviar() {
    const texto = entrada.trim();
    if (!texto) return;

    // Adiciona a mensagem do usuário
    mensagens = [...mensagens, { autor: 'usuario', texto }];
    entrada = '';

    // Mostra "professor está digitando..."
    digitando = true;

    // Simula um pequeno delay pra parecer mais natural
    await new Promise((r) => setTimeout(r, 600));

    // Gera a resposta
    const resposta = responder(texto);

    mensagens = [...mensagens, { autor: 'professor', texto: resposta.texto }];
    digitando = false;

    // Fala a resposta em voz alta
    falar(resposta.texto);
  }

  function ouvirMensagem(texto) {
    falar(texto);
  }

  function usarSugestao(texto) {
    entrada = texto;
  }

  function limpar() {
    mensagens = [
      {
        autor: 'professor',
        texto: 'Hello! Let\'s start a new conversation. What would you like to talk about?'
      }
    ];
  }
</script>

<div class="container">
  <div class="header">
    <span class="titulo">🤖 Professor IA</span>
    <button class="limpar" on:click={limpar}>🗑️ Nova conversa</button>
  </div>

  <div class="chat">
    {#each mensagens as msg}
      <div class="mensagem {msg.autor}">
        <div class="balao">
          {msg.texto}
          {#if msg.autor === 'professor'}
            <button class="ouvir" on:click={() => ouvirMensagem(msg.texto)}>🔊</button>
          {/if}
        </div>
      </div>
    {/each}

    {#if digitando}
      <div class="mensagem professor">
        <div class="balao digitando">
          <span></span><span></span><span></span>
        </div>
      </div>
    {/if}
  </div>

  {#if mensagens.length <= 1}
    <div class="sugestoes">
      <p>Experimente:</p>
      <div class="chips">
        {#each SUGESTOES_INICIAIS as s}
          <button on:click={() => usarSugestao(s)}>{s}</button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="input-area">
    <input
      type="text"
      bind:value={entrada}
      placeholder="Digite em inglês..."
      on:keydown={(e) => e.key === 'Enter' && enviar()}
    />
    <button on:click={enviar} disabled={!entrada.trim()}>➤</button>
  </div>
</div>

<style>
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: 70vh;
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    overflow: hidden;
    text-align: left;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #6366f1;
    color: white;
  }

  .titulo {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .limpar {
    background: rgba(255,255,255,0.2);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .limpar:hover {
    background: rgba(255,255,255,0.3);
  }

  .chat {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f8fafc;
  }

  .mensagem {
    display: flex;
  }

  .mensagem.usuario {
    justify-content: flex-end;
  }

  .balao {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 0.95rem;
    line-height: 1.4;
    position: relative;
  }

  .mensagem.professor .balao {
    background: white;
    color: #1a1a1a;
    border-bottom-left-radius: 4px;
  }

  .mensagem.usuario .balao {
    background: #6366f1;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .ouvir {
    background: transparent;
    border: none;
    font-size: 1rem;
    margin-left: 8px;
    cursor: pointer;
    opacity: 0.6;
  }

  .ouvir:hover {
    opacity: 1;
  }

  .digitando {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .digitando span {
    width: 8px;
    height: 8px;
    background: #94a3b8;
    border-radius: 50%;
    animation: pular 1.4s infinite;
  }

  .digitando span:nth-child(2) { animation-delay: 0.2s; }
  .digitando span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes pular {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }

  .sugestoes {
    padding: 12px 20px 0;
    background: white;
  }

  .sugestoes p {
    margin: 0 0 8px 0;
    font-size: 0.8rem;
    color: #666;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chips button {
    padding: 6px 12px;
    background: #eef2ff;
    color: #3730a3;
    border: none;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .chips button:hover {
    background: #c7d2fe;
  }

  .input-area {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    background: white;
    border-top: 1px solid #e2e8f0;
  }

  .input-area input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-area input:focus {
    border-color: #6366f1;
  }

  .input-area button {
    padding: 0 20px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .input-area button:hover:not(:disabled) {
    background: #4f46e5;
  }

  .input-area button:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
</style>
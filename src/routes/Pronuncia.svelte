<script>
  import { onMount } from 'svelte';
  import { db } from '../lib/db.js';
  import { falar } from '../lib/tts.js';
  import { ouvir, suportaASR, compararTranscricao } from '../lib/asr.js';

  let palavras = [];
  let carregando = true;
  let palavraAtual = 0;
  let gravando = false;
  let resultado = null;
  let erro = null;
  let suportado = false;

  onMount(async () => {
    suportado = suportaASR();
    palavras = await db.words.toArray();
    palavras = palavras.sort(() => Math.random() - 0.5);
    carregando = false;
  });

  function ouvirNativo() {
    falar(palavras[palavraAtual].english);
  }

  function comecarGravacao() {
    resultado = null;
    erro = null;
    gravando = true;

    ouvir(
      (texto) => {
        const esperado = palavras[palavraAtual].english;
        resultado = compararTranscricao(esperado, texto);
      },
      (msg) => {
        erro = msg;
      },
      () => {
        gravando = false;
      }
    );
  }

  function proxima() {
    resultado = null;
    erro = null;
    palavraAtual = (palavraAtual + 1) % palavras.length;
  }

  function anterior() {
    resultado = null;
    erro = null;
    palavraAtual = (palavraAtual - 1 + palavras.length) % palavras.length;
  }
</script>

<div class="container">
  {#if carregando}
    <p>Carregando...</p>
  {:else if !suportado}
    <div class="aviso">
      ⚠️ Seu navegador não suporta reconhecimento de voz. Use <strong>Chrome</strong> ou <strong>Edge</strong>.
    </div>
  {:else if palavras.length === 0}
    <p>Nenhuma palavra cadastrada.</p>
  {:else}
    <p class="contador">{palavraAtual + 1} / {palavras.length}</p>

    <div class="card">
      <h2 class="ingles">{palavras[palavraAtual].english}</h2>
      <p class="traducao">{palavras[palavraAtual].portuguese}</p>

      <button class="botao-nativo" on:click={ouvirNativo}>
        🔊 Ouvir pronúncia nativa
      </button>

      <button
        class="botao-microfone"
        class:gravando
        on:click={comecarGravacao}
        disabled={gravando}
      >
        {#if gravando}
          🎤 Ouvindo...
        {:else}
          🎤 Falar
        {/if}
      </button>
    </div>

    {#if erro}
      <div class="erro">
        ⚠️ {erro}
      </div>
    {/if}

    {#if resultado}
      <div class="resultado {resultado.status}">
        <div class="status">
          {#if resultado.status === 'correto'}
            ✅ Boa!
          {:else if resultado.status === 'quase'}
            🟡 Quase!
          {:else}
            ❌ Não entendi
          {/if}
        </div>
        <p class="mensagem">{resultado.mensagem}</p>
        <div class="detalhes">
          <div><strong>Esperado:</strong> {resultado.esperado}</div>
          <div><strong>O que ouvi:</strong> {resultado.transcrito}</div>
        </div>
      </div>
    {/if}

    <div class="navegacao">
      <button on:click={anterior}>← Anterior</button>
      <button on:click={proxima}>Próxima →</button>
    </div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    text-align: center;
  }

  .contador {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .card {
    background: white;
    border-radius: 20px;
    padding: 40px 20px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .ingles {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
  }

  .traducao {
    color: #666;
    margin: 0 0 1.5rem 0;
  }

  .botao-nativo {
    width: 100%;
    padding: 14px;
    margin-bottom: 10px;
    font-size: 1rem;
    background: #eef2ff;
    color: #3730a3;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .botao-nativo:hover {
    background: #c7d2fe;
  }

  .botao-microfone {
    width: 100%;
    padding: 20px;
    font-size: 1.2rem;
    font-weight: 600;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .botao-microfone:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-2px);
  }

  .botao-microfone:disabled {
    background: #ef4444;
    cursor: not-allowed;
    animation: pulsar 1.2s infinite;
  }

  @keyframes pulsar {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .resultado {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 1rem;
    border-left: 4px solid #ccc;
    text-align: left;
  }

  .resultado.correto { border-left-color: #10b981; background: #f0fdf4; }
  .resultado.quase   { border-left-color: #f59e0b; background: #fffbeb; }
  .resultado.errado  { border-left-color: #ef4444; background: #fef2f2; }

  .status {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .mensagem {
    color: #555;
    font-size: 0.9rem;
    margin: 0 0 12px 0;
  }

  .detalhes {
    font-size: 0.85rem;
    color: #444;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .erro {
    background: #fef2f2;
    color: #991b1b;
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .navegacao {
    display: flex;
    gap: 12px;
  }

  .navegacao button {
    flex: 1;
    padding: 14px;
    font-size: 1rem;
    border: none;
    border-radius: 12px;
    background: #6366f1;
    color: white;
    cursor: pointer;
  }

  .navegacao button:hover {
    background: #4f46e5;
  }

  .aviso {
    background: #fffbeb;
    color: #78350f;
    padding: 20px;
    border-radius: 12px;
    font-size: 0.95rem;
  }
</style>
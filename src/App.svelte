<script>
  import Vocabulario from './routes/Vocabulario.svelte';
  import Vozes from './routes/Vozes.svelte';
  import Progresso from './routes/Progresso.svelte';
  import Pronuncia from './routes/Pronuncia.svelte';
  import Professor from './routes/Professor.svelte';
  import Diagnostico from './routes/Diagnostico.svelte';
  import IALocal from './routes/IALocal.svelte';
  import Configuracoes from './routes/Configuracoes.svelte';
  import Backup from './routes/Backup.svelte';
  import { onMount } from 'svelte';
  import { db } from './lib/db.js';

  let telaAtual = 'menu';

  function irPara(tela) {
    telaAtual = tela;
  }

  onMount(async () => {
    const config = await db.settings.get('principal');
    if (config?.theme === 'escuro') {
      document.body.classList.add('escuro');
    }
  });
</script>

<main>
  {#if telaAtual === 'menu'}
    <div class="container">
      <h1>📚 English Tutor</h1>
      <p class="subtitulo">Seu professor de inglês offline</p>

      <div class="menu">
        <button on:click={() => irPara('vocabulario')}>
          📖 Estudar Vocabulário
        </button>
        <button on:click={() => irPara('pronuncia')}>
          🎤 Praticar Pronúncia
        </button>
        <button on:click={() => irPara('professor')}>
          🤖 Conversar (respostas prontas)
        </button>
        <button on:click={() => irPara('ialocal')}>
          🧠 Conversar com IA Local
        </button>
        <button on:click={() => irPara('progresso')}>
          📊 Ver Progresso
        </button>
        <button on:click={() => irPara('backup')}>
          💾 Backup dos dados
        </button>
        <button on:click={() => irPara('vozes')}>
          🎙️ Testar Vozes
        </button>
        <button on:click={() => irPara('diagnostico')}>
          🔍 Diagnóstico do Dispositivo
        </button>
        <button on:click={() => irPara('configuracoes')}>
          ⚙️ Configurações
        </button>
      </div>
    </div>
  {:else if telaAtual === 'vocabulario'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Vocabulario />
    </div>
  {:else if telaAtual === 'progresso'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Progresso />
    </div>
  {:else if telaAtual === 'pronuncia'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Pronuncia />
    </div>
  {:else if telaAtual === 'professor'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Professor />
    </div>
  {:else if telaAtual === 'ialocal'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <IALocal />
    </div>
  {:else if telaAtual === 'vozes'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Vozes />
    </div>
  {:else if telaAtual === 'diagnostico'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Diagnostico />
    </div>
  {:else if telaAtual === 'configuracoes'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Configuracoes />
    </div>
  {:else if telaAtual === 'backup'}
    <div class="container">
      <button class="voltar" on:click={() => irPara('menu')}>← Voltar</button>
      <Backup />
    </div>
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .container {
    max-width: 500px;
    width: 100%;
    text-align: center;
  }

  h1 { font-size: 2rem; margin-bottom: 0.5rem; }

  .subtitulo {
    color: var(--texto-secundario);
    margin-bottom: 2rem;
  }

  .menu { display: flex; flex-direction: column; gap: 12px; }

  button {
    padding: 16px;
    font-size: 1.1rem;
    border: none;
    border-radius: 12px;
    background: var(--roxo);
    color: white;
    cursor: pointer;
    transition: transform 0.1s, background 0.2s;
  }

  button:hover:not(:disabled) {
    background: var(--roxo-escuro);
    transform: translateY(-2px);
  }

  button:disabled {
    background: var(--borda-forte);
    cursor: not-allowed;
  }

  .voltar {
    background: var(--cinza-botao);
    color: var(--cinza-texto-botao);
    padding: 10px 16px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    align-self: flex-start;
  }

  .voltar:hover {
    background: var(--cinza-botao-hover);
  }
</style>
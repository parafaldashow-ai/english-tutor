<script>
  import { onMount } from 'svelte';

  let vozes = [];
  let vozSelecionada = null;

  onMount(() => {
    const carregar = () => {
      vozes = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    };
    carregar();
    speechSynthesis.onvoiceschanged = carregar;
  });

  function testarVoz(voz) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Hello, this is a test of my voice.');
    u.voice = voz;
    u.lang = voz.lang;
    u.rate = 0.9;
    speechSynthesis.speak(u);
    vozSelecionada = voz;
  }
</script>

<div class="vozes">
  <h2>🎙️ Vozes em inglês disponíveis</h2>
  <p class="subtitulo">Clique em uma voz para ouvir um teste</p>

  {#if vozes.length === 0}
    <p class="vazio">Nenhuma voz em inglês encontrada no seu sistema.</p>
  {:else}
    <ul>
      {#each vozes as voz}
        <li class:selecionada={vozSelecionada?.name === voz.name}>
          <button on:click={() => testarVoz(voz)}>
            <span class="nome">{voz.name}</span>
            <span class="lang">{voz.lang}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .vozes {
    width: 100%;
    text-align: left;
  }

  h2 {
    text-align: center;
    margin-bottom: 0.25rem;
  }

  .subtitulo {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .vazio {
    text-align: center;
    color: #999;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li button {
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  li button:hover {
    border-color: #6366f1;
    background: #f5f5ff;
  }

  li.selecionada button {
    border-color: #6366f1;
    background: #eef2ff;
  }

  .nome {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .lang {
    color: #999;
    font-size: 0.8rem;
  }
</style>
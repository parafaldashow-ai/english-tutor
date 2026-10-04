<script>
  import { onMount } from 'svelte';
  import { db, palavrasParaRevisar, atualizarPalavra } from '../lib/db.js';
  import { falar, carregarVozes } from '../lib/tts.js';
  import { processarResposta, previsaoProximaRevisao } from '../lib/srs.js';

  let palavras = [];
  let carregando = true;
  let palavraAtual = 0;
  let mostrandoTraducao = false;
  let sessaoConcluida = false;
  let acertosNaSessao = 0;
  let errosNaSessao = 0;

  onMount(async () => {
    await carregarVozes();

    // Busca palavras que precisam ser revisadas hoje
    let paraRevisar = await palavrasParaRevisar();

    // Se não tem nenhuma pra revisar, pega todas
    if (paraRevisar.length === 0) {
      paraRevisar = await db.words.toArray();
    }

    // Embaralha
    palavras = paraRevisar.sort(() => Math.random() - 0.5);
    carregando = false;
  });

  function revelarTraducao() {
    mostrandoTraducao = true;
  }

  function ouvir(evento) {
    evento.stopPropagation();
    falar(palavras[palavraAtual].english);
  }

  async function responder(resposta) {
    const palavra = palavras[palavraAtual];

    await processarResposta(palavra, resposta);

    if (resposta === 'acertei') acertosNaSessao++;
    else errosNaSessao++;

    // Próxima palavra
    if (palavraAtual + 1 >= palavras.length) {
      sessaoConcluida = true;
    } else {
      palavraAtual++;
      mostrandoTraducao = false;
    }
  }

  function reiniciar() {
    window.location.reload();
  }
</script>

<div class="container">
  {#if carregando}
    <p>Carregando...</p>
  {:else if palavras.length === 0}
    <p>Nenhuma palavra cadastrada ainda.</p>
  {:else if sessaoConcluida}
    <div class="resumo">
      <h2>🎉 Sessão concluída!</h2>
      <div class="numeros">
        <div class="numero">
          <span class="valor acerto">{acertosNaSessao}</span>
          <span class="label">acertos</span>
        </div>
        <div class="numero">
          <span class="valor erro">{errosNaSessao}</span>
          <span class="label">erros</span>
        </div>
      </div>
      <button class="reiniciar" on:click={reiniciar}>🔄 Nova sessão</button>
    </div>
  {:else}
    <p class="contador">{palavraAtual + 1} / {palavras.length}</p>

    <div class="card" on:click={revelarTraducao}>
      <h2 class="ingles">{palavras[palavraAtual].english}</h2>

      <button class="botao-audio" on:click={ouvir} title="Ouvir pronúncia">
        🔊
      </button>

      {#if mostrandoTraducao}
        <p class="traducao">{palavras[palavraAtual].portuguese}</p>
        <p class="categoria">{palavras[palavraAtual].category}</p>
      {:else}
        <p class="dica">Toque no card para ver a tradução</p>
      {/if}
    </div>

    {#if mostrandoTraducao}
      <div class="botoes-resposta">
        <button class="botao-errei" on:click={() => responder('errei')}>
          ❌ Errei
          <small>volta em 1 dia</small>
        </button>
        <button class="botao-acertei" on:click={() => responder('acertei')}>
          ✅ Acertei
          <small>{previsaoProximaRevisao(palavras[palavraAtual], 'acertei')}</small>
        </button>
      </div>
    {/if}
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
    padding: 60px 20px 40px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    cursor: pointer;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: transform 0.1s;
  }

  .card:hover {
    transform: translateY(-2px);
  }

  .ingles {
    font-size: 2.5rem;
    margin: 0 0 1rem 0;
    color: #1a1a1a;
  }

  .botao-audio {
    background: #eef2ff;
    border: none;
    font-size: 1.8rem;
    padding: 12px 20px;
    border-radius: 50px;
    cursor: pointer;
    margin-bottom: 1rem;
    transition: background 0.2s, transform 0.1s;
  }

  .botao-audio:hover {
    background: #c7d2fe;
    transform: scale(1.1);
  }

  .traducao {
    font-size: 1.5rem;
    color: #6366f1;
    margin: 0.5rem 0;
  }

  .categoria {
    font-size: 0.85rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 1rem;
  }

  .dica {
    color: #999;
    font-size: 0.9rem;
    margin: 0;
  }

  .botoes-resposta {
    display: flex;
    gap: 12px;
  }

  .botoes-resposta button {
    flex: 1;
    padding: 16px 12px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 1.05rem;
    font-weight: 600;
    transition: transform 0.1s;
  }

  .botoes-resposta button:hover {
    transform: translateY(-2px);
  }

  .botoes-resposta small {
    font-size: 0.75rem;
    font-weight: 400;
    opacity: 0.8;
  }

  .botao-errei {
    background: #fee2e2;
    color: #991b1b;
  }

  .botao-errei:hover {
    background: #fecaca;
  }

  .botao-acertei {
    background: #d1fae5;
    color: #065f46;
  }

  .botao-acertei:hover {
    background: #a7f3d0;
  }

  .resumo {
    background: white;
    border-radius: 20px;
    padding: 40px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .resumo h2 {
    margin: 0 0 1.5rem 0;
  }

  .numeros {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 2rem;
  }

  .numero {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .valor {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .valor.acerto { color: #10b981; }
  .valor.erro { color: #ef4444; }

  .label {
    color: #666;
    font-size: 0.9rem;
  }

  .reiniciar {
    padding: 14px 28px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
  }

  .reiniciar:hover {
    background: #4f46e5;
  }
</style>
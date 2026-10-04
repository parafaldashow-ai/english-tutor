<script>
  import { onMount } from 'svelte';
  import { estatisticas } from '../lib/db.js';

  let stats = null;
  let carregando = true;

  onMount(async () => {
    stats = await estatisticas();
    carregando = false;
  });

  function percentual(valor, total) {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  }
</script>

<div class="container">
  {#if carregando}
    <p>Carregando...</p>
  {:else if stats}
    <h2>📊 Seu progresso</h2>

    <div class="grid">
      <div class="card total">
        <span class="numero">{stats.total}</span>
        <span class="label">palavras no total</span>
      </div>

      <div class="card dominadas">
        <span class="numero">{stats.dominadas}</span>
        <span class="label">dominadas</span>
      </div>

      <div class="card aprendendo">
        <span class="numero">{stats.aprendendo}</span>
        <span class="label">aprendendo</span>
      </div>

      <div class="card novas">
        <span class="numero">{stats.novas}</span>
        <span class="label">novas</span>
      </div>
    </div>

    <div class="barra-titulo">Progresso geral</div>

    <div class="barra">
      <div class="barra-preenchida dominadas" style="width: {percentual(stats.dominadas, stats.total)}%"></div>
      <div class="barra-preenchida aprendendo" style="width: {percentual(stats.aprendendo, stats.total)}%"></div>
    </div>

    <div class="legenda">
      <span><span class="dot dominadas"></span> Dominadas</span>
      <span><span class="dot aprendendo"></span> Aprendendo</span>
      <span><span class="dot novas"></span> Novas</span>
    </div>

    <div class="card-erros">
      <div class="linha">
        <span class="icone">✅</span>
        <span class="texto">Acertos totais</span>
        <span class="valor acerto">{stats.totalAcertos}</span>
      </div>
      <div class="linha">
        <span class="icone">❌</span>
        <span class="texto">Erros totais</span>
        <span class="valor erro">{stats.totalErros}</span>
      </div>
      {#if stats.totalAcertos + stats.totalErros > 0}
        <div class="linha destaque">
          <span class="icone">🎯</span>
          <span class="texto">Taxa de acerto</span>
          <span class="valor">
            {Math.round((stats.totalAcertos / (stats.totalAcertos + stats.totalErros)) * 100)}%
          </span>
        </div>
      {/if}
    </div>

    <div class="para-revisar">
      <span class="icone">📅</span>
      <span class="texto">Para revisar hoje</span>
      <span class="valor">{stats.paraRevisar}</span>
    </div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    text-align: center;
  }

  h2 {
    margin-bottom: 1.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 1.5rem;
  }

  .card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card.total { border-top: 4px solid #6366f1; }
  .card.dominadas { border-top: 4px solid #10b981; }
  .card.aprendendo { border-top: 4px solid #f59e0b; }
  .card.novas { border-top: 4px solid #94a3b8; }

  .numero {
    font-size: 2.2rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  .label {
    color: #666;
    font-size: 0.85rem;
  }

  .barra-titulo {
    text-align: left;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .barra {
    width: 100%;
    height: 16px;
    background: #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    margin-bottom: 0.75rem;
  }

  .barra-preenchida {
    height: 100%;
    transition: width 0.5s;
  }

  .barra-preenchida.dominadas { background: #10b981; }
  .barra-preenchida.aprendendo { background: #f59e0b; }

  .legenda {
    display: flex;
    justify-content: center;
    gap: 16px;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 1.5rem;
  }

  .legenda span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .dot.dominadas { background: #10b981; }
  .dot.aprendendo { background: #f59e0b; }
  .dot.novas { background: #94a3b8; }

  .card-erros {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    margin-bottom: 1rem;
  }

  .linha {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .linha:last-child {
    border-bottom: none;
  }

  .linha.destaque {
    background: #fef3c7;
    border-radius: 8px;
    padding: 10px 12px;
    margin-top: 6px;
    border-bottom: none;
  }

  .icone {
    font-size: 1.3rem;
  }

  .texto {
    flex: 1;
    text-align: left;
    color: #333;
  }

  .valor {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .valor.acerto { color: #10b981; }
  .valor.erro { color: #ef4444; }

  .para-revisar {
    background: #eef2ff;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #3730a3;
    font-weight: 500;
  }
</style>
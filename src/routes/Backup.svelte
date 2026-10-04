<script>
  import { db, exportarDados, importarDados, estatisticas } from '../lib/db.js';

  let stats = null;
  let mensagem = '';
  let tipoMensagem = 'ok';
  let inputFile;

  // Carrega estatísticas ao abrir
  async function carregarStats() {
    stats = await estatisticas();
  }

  carregarStats();

  async function exportar() {
    try {
      const dados = await exportarDados();

      // Cria o arquivo
      const json = JSON.stringify(dados, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      // Nome do arquivo com data
      const data = new Date().toISOString().slice(0, 10);
      const nome = `english-tutor-backup-${data}.json`;

      // Baixa
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nome;
      a.click();
      URL.revokeObjectURL(url);

      mostrar('✅ Backup baixado: ' + nome, 'ok');
    } catch (e) {
      console.error(e);
      mostrar('❌ Erro ao exportar: ' + e.message, 'erro');
    }
  }

  async function escolherArquivo() {
    inputFile.click();
  }

  async function importar(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    const confirmar = confirm(
      '⚠️ ATENÇÃO!\n\nImportar vai SUBSTITUIR todos os dados atuais pelos do arquivo.\n\nContinuar?'
    );

    if (!confirmar) {
      evento.target.value = '';
      return;
    }

    try {
      const texto = await arquivo.text();
      const dados = JSON.parse(texto);
      const resultado = await importarDados(dados);

      await carregarStats();

      mostrar(
        `✅ Importado! ${resultado.palavras} palavras, ${resultado.frases} frases.`,
        'ok'
      );

      evento.target.value = '';
    } catch (e) {
      console.error(e);
      mostrar('❌ Erro ao importar: ' + e.message, 'erro');
      evento.target.value = '';
    }
  }

  function mostrar(texto, tipo) {
    mensagem = texto;
    tipoMensagem = tipo;
    setTimeout(() => (mensagem = ''), 5000);
  }
</script>

<div class="container">
  <h2>💾 Backup dos dados</h2>
  <p class="subtitulo">Salve e restaure seu progresso</p>

  {#if stats}
    <div class="secao">
      <h3>📊 O que será salvo</h3>
      <div class="linha">
        <span>Palavras</span>
        <span class="valor">{stats.total}</span>
      </div>
      <div class="linha">
        <span>Dominadas</span>
        <span class="valor">{stats.dominadas}</span>
      </div>
      <div class="linha">
        <span>Acertos totais</span>
        <span class="valor">{stats.totalAcertos}</span>
      </div>
      <div class="linha">
        <span>Erros totais</span>
        <span class="valor">{stats.totalErros}</span>
      </div>
    </div>
  {/if}

  <div class="secao">
    <h3>📥 Exportar</h3>
    <p class="info">
      Baixa um arquivo <strong>.json</strong> com todas as suas palavras,
      frases e configurações. Guarde em um lugar seguro.
    </p>
    <button class="botao-primario" on:click={exportar}>
      📥 Baixar backup
    </button>
  </div>

  <div class="secao">
    <h3>📤 Importar</h3>
    <p class="info">
      Restaura um backup salvo. <strong>Atenção:</strong> substitui todos os dados atuais.
    </p>
    <button class="botao-aviso" on:click={escolherArquivo}>
      📤 Escolher arquivo
    </button>
    <input
      type="file"
      accept=".json,application/json"
      bind:this={inputFile}
      on:change={importar}
      style="display: none;"
    />
  </div>

  {#if mensagem}
    <div class="mensagem {tipoMensagem}">{mensagem}</div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    text-align: left;
  }

  h2 {
    text-align: center;
    margin-bottom: 0.25rem;
    color: var(--texto-principal);
  }

  .subtitulo {
    text-align: center;
    color: var(--texto-secundario);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .secao {
    background: var(--bg-card);
    color: var(--texto-principal);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 10px var(--sombra);
  }

  .secao h3 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    color: var(--roxo);
  }

  .linha {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--borda);
    font-size: 0.9rem;
  }

  .linha:last-child {
    border-bottom: none;
  }

  .valor {
    font-weight: 700;
    color: var(--texto-principal);
  }

  .info {
    font-size: 0.85rem;
    color: var(--texto-secundario);
    line-height: 1.5;
    margin: 0 0 12px 0;
  }

  .botao-primario {
    width: 100%;
    padding: 14px;
    background: var(--roxo);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .botao-primario:hover {
    background: var(--roxo-escuro);
  }

  .botao-aviso {
    width: 100%;
    padding: 14px;
    background: #fffbeb;
    color: #78350f;
    border: 2px dashed #f59e0b;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .botao-aviso:hover {
    background: #fef3c7;
  }

  .mensagem {
    padding: 12px;
    border-radius: 10px;
    font-size: 0.9rem;
    text-align: center;
    word-break: break-word;
  }

  .mensagem.ok {
    background: #f0fdf4;
    color: #065f46;
  }

  .mensagem.erro {
    background: #fef2f2;
    color: #991b1b;
  }
</style>
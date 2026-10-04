<script>
  import { onMount } from 'svelte';

  let info = {
    carregando: true,
    webgpu: false,
    webgpuDetalhes: null,
    webgl: false,
    memoria: 'desconhecida',
    nucleos: 'desconhecido',
    plataforma: 'desconhecida'
  };

  onMount(async () => {
    // Info básica do navegador
    info.nucleos = navigator.hardwareConcurrency || 'desconhecido';
    info.plataforma = navigator.platform || 'desconhecida';

    // Memória (Chrome)
    if (navigator.deviceMemory) {
      info.memoria = `${navigator.deviceMemory} GB`;
    }

    // WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      info.webgl = !!gl;
    } catch (e) {
      info.webgl = false;
    }

    // WebGPU
    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          info.webgpu = true;
          const adapterInfo = adapter.info || {};
          info.webgpuDetalhes = {
            vendor: adapterInfo.vendor || 'desconhecido',
            architecture: adapterInfo.architecture || 'desconhecida',
            device: adapterInfo.device || 'desconhecido',
            description: adapterInfo.description || 'sem descrição'
          };
        } else {
          info.webgpu = false;
        }
      } catch (e) {
        console.error('Erro WebGPU:', e);
        info.webgpu = false;
      }
    }

    info.carregando = false;
  });

  function veredito() {
    if (info.carregando) return null;

    if (info.webgpu) {
      return {
        nivel: 'otimo',
        titulo: '✅ IA local é possível!',
        descricao: 'Seu dispositivo suporta WebGPU. Você pode rodar modelos de IA locais (Qwen 0.5B ou similar) diretamente no navegador, sem internet.'
      };
    }

    if (info.webgl) {
      return {
        nivel: 'medio',
        titulo: '🟡 IA local limitada',
        descricao: 'Seu dispositivo não tem WebGPU, mas tem WebGL. Você pode rodar modelos MUITO pequenos, com qualidade baixa. O ideal seria usar o sistema de respostas pré-escritas (que já funciona perfeitamente).'
      };
    }

    return {
      nivel: 'ruim',
      titulo: '❌ IA local não é viável',
      descricao: 'Seu dispositivo não tem suporte pra aceleração de hardware adequada. O sistema de respostas pré-escritas (camada 1) é a melhor opção. Continua funcionando 100% offline.'
    };
  }

  $: v = veredito();
</script>

<div class="container">
  <h2>🔍 Diagnóstico do dispositivo</h2>
  <p class="subtitulo">Verifica se seu dispositivo suporta IA local</p>

  {#if info.carregando}
    <p>Analisando...</p>
  {:else}
    <div class="info-grid">
      <div class="info-item">
        <span class="label">WebGPU</span>
        <span class="valor" class:ok={info.webgpu} class:no={!info.webgpu}>
          {info.webgpu ? '✅ Suportado' : '❌ Não suportado'}
        </span>
      </div>

      <div class="info-item">
        <span class="label">WebGL</span>
        <span class="valor" class:ok={info.webgl} class:no={!info.webgl}>
          {info.webgl ? '✅ Suportado' : '❌ Não suportado'}
        </span>
      </div>

      <div class="info-item">
        <span class="label">Núcleos de CPU</span>
        <span class="valor">{info.nucleos}</span>
      </div>

      <div class="info-item">
        <span class="label">Memória estimada</span>
        <span class="valor">{info.memoria}</span>
      </div>

      <div class="info-item">
        <span class="label">Plataforma</span>
        <span class="valor">{info.plataforma}</span>
      </div>
    </div>

    {#if info.webgpuDetalhes}
      <div class="gpu-info">
        <h3>🎮 GPU detectada</h3>
        <div class="info-item">
          <span class="label">Fabricante</span>
          <span class="valor">{info.webgpuDetalhes.vendor}</span>
        </div>
        <div class="info-item">
          <span class="label">Arquitetura</span>
          <span class="valor">{info.webgpuDetalhes.architecture}</span>
        </div>
        <div class="info-item">
          <span class="label">Dispositivo</span>
          <span class="valor">{info.webgpuDetalhes.device}</span>
        </div>
      </div>
    {/if}

    {#if v}
      <div class="veredito {v.nivel}">
        <h3>{v.titulo}</h3>
        <p>{v.descricao}</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .container {
    width: 100%;
    text-align: center;
  }

  h2 {
    margin-bottom: 0.25rem;
  }

  .subtitulo {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .info-grid {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    margin-bottom: 1rem;
    text-align: left;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .label {
    color: #666;
    font-size: 0.9rem;
  }

  .valor {
    font-weight: 600;
    font-size: 0.95rem;
    color: #1a1a1a;
  }

  .valor.ok { color: #10b981; }
  .valor.no { color: #ef4444; }

  .gpu-info {
    background: #f0f9ff;
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 1rem;
    text-align: left;
  }

  .gpu-info h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: #0369a1;
  }

  .veredito {
    border-radius: 16px;
    padding: 20px;
    text-align: left;
    border-left: 4px solid #ccc;
  }

  .veredito.otimo { background: #f0fdf4; border-left-color: #10b981; }
  .veredito.medio { background: #fffbeb; border-left-color: #f59e0b; }
  .veredito.ruim  { background: #fef2f2; border-left-color: #ef4444; }

  .veredito h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
  }

  .veredito p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    line-height: 1.5;
  }
</style>
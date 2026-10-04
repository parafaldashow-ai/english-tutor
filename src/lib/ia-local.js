// IA local com WebLLM (usa WebGPU)

let engine = null;
let carregando = false;
let modeloAtual = null;

export const MODELO_PADRAO = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

export function suportaWebGPU() {
  return 'gpu' in navigator;
}

export async function carregarModelo(onProgresso) {
  if (engine) {
    console.log('[IA] Modelo já carregado');
    return engine;
  }

  if (carregando) {
    console.log('[IA] Já está carregando...');
    return null;
  }

  if (!suportaWebGPU()) {
    throw new Error('WebGPU não é suportado neste navegador.');
  }

  carregando = true;

  try {
    console.log('[IA] Importando WebLLM...');
    const webllm = await import('@mlc-ai/web-llm');

    console.log('[IA] Criando engine...');
    engine = await webllm.CreateMLCEngine(
      MODELO_PADRAO,
      {
        initProgressCallback: (report) => {
          console.log('[IA] Progresso:', report.text);
          if (onProgresso) onProgresso(report.text);
        }
      }
    );

    modeloAtual = MODELO_PADRAO;
    carregando = false;
    console.log('[IA] Modelo carregado com sucesso!');
    return engine;

  } catch (erro) {
    console.error('[IA] Erro ao carregar:', erro);
    carregando = false;
    throw erro;
  }
}

export async function gerarResposta(mensagem, historico = []) {
  if (!engine) {
    throw new Error('Modelo ainda não foi carregado.');
  }

  const mensagens = [
    {
      role: 'system',
      content: 'You are a friendly English tutor for Brazilian students. Answer in simple English (A2-B1 level). Keep responses short (1-2 sentences). Be encouraging and helpful. If the student makes a mistake, gently correct them.'
    },
    ...historico,
    { role: 'user', content: mensagem }
  ];

  console.log('[IA] Enviando mensagem:', mensagem);

  const resposta = await engine.chat.completions.create({
    messages: mensagens,
    temperature: 0.7,
    max_tokens: 100
  });

  const texto = resposta.choices[0].message.content;
  console.log('[IA] Resposta:', texto);

  return texto;
}

export function modeloEstaPronto() {
  return engine !== null;
}

export async function descarregarModelo() {
  if (engine) {
    await engine.unload();
    engine = null;
    modeloAtual = null;
    console.log('[IA] Modelo descarregado');
  }
}
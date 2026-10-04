// ASR — Automatic Speech Recognition
// Usa a Web Speech API nativa do navegador
// ATENÇÃO: só funciona no Chrome/Edge (Chromium), e requer internet na 1ª vez

let reconhecimento = null;
let ouvindo = false;
let callbackAtual = null;

// Verifica se o navegador suporta a API
export function suportaASR() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Inicia o reconhecimento
// onResultado: função chamada quando o navegador entende algo
// onErro: função chamada se der erro
// onFim: função chamada quando o reconhecimento termina
export function ouvir(onResultado, onErro, onFim) {
  if (!suportaASR()) {
    if (onErro) onErro('Navegador não suporta reconhecimento de voz. Use Chrome ou Edge.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  reconhecimento = new SpeechRecognition();

  reconhecimento.lang = 'en-US';
  reconhecimento.continuous = false;
  reconhecimento.interimResults = false;
  reconhecimento.maxAlternatives = 1;

  callbackAtual = onResultado;

  reconhecimento.onstart = () => {
    ouvindo = true;
    console.log('[ASR] Ouvindo...');
  };

  reconhecimento.onresult = (event) => {
    const resultado = event.results[0][0].transcript;
    console.log('[ASR] Ouviu:', resultado);
    if (callbackAtual) callbackAtual(resultado);
  };

  reconhecimento.onerror = (event) => {
    console.error('[ASR] Erro:', event.error);
    ouvindo = false;
    if (onErro) {
      const mensagens = {
        'not-allowed': 'Permissão de microfone negada.',
        'no-speech': 'Não ouvi nada. Tente de novo.',
        'audio-capture': 'Microfone não encontrado.',
        'network': 'Erro de rede. Verifique sua internet.',
        'aborted': 'Gravação cancelada.'
      };
      onErro(mensagens[event.error] || `Erro: ${event.error}`);
    }
  };

  reconhecimento.onend = () => {
    ouvindo = false;
    console.log('[ASR] Terminou');
    if (onFim) onFim();
  };

  try {
    reconhecimento.start();
  } catch (e) {
    console.error('[ASR] Erro ao iniciar:', e);
    if (onErro) onErro('Erro ao iniciar o microfone.');
  }
}

// Para o reconhecimento
export function parar() {
  if (reconhecimento && ouvindo) {
    reconhecimento.stop();
  }
}

// Compara a transcrição com o esperado
// Retorna um objeto com o resultado e feedback
export function compararTranscricao(esperado, transcrito) {
  const limpar = (s) => s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ');

  const esperadoLimpo = limpar(esperado);
  const transcritoLimpo = limpar(transcrito);

  const igual = esperadoLimpo === transcritoLimpo;

  // Similaridade simples por caracteres
  const similaridade = calcularSimilaridade(esperadoLimpo, transcritoLimpo);

  let status;
  let mensagem;

  if (igual) {
    status = 'correto';
    mensagem = 'Boa! O que você falou bate com o esperado.';
  } else if (similaridade >= 0.7) {
    status = 'quase';
    mensagem = 'Quase! Ouvi algo parecido, mas não exatamente.';
  } else {
    status = 'errado';
    mensagem = 'Não entendi direito. Tente falar mais devagar e claro.';
  }

  return {
    status,
    mensagem,
    esperado: esperadoLimpo,
    transcrito: transcritoLimpo,
    similaridade: Math.round(similaridade * 100)
  };
}

// Algoritmo de similaridade (Levenshtein simplificado)
function calcularSimilaridade(a, b) {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matriz = [];
  for (let i = 0; i <= b.length; i++) {
    matriz[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matriz[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matriz[i][j] = matriz[i - 1][j - 1];
      } else {
        matriz[i][j] = Math.min(
          matriz[i - 1][j - 1] + 1,
          matriz[i][j - 1] + 1,
          matriz[i - 1][j] + 1
        );
      }
    }
  }

  const distancia = matriz[b.length][a.length];
  const tamanhoMax = Math.max(a.length, b.length);
  return 1 - distancia / tamanhoMax;
}
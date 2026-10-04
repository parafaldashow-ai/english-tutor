// Helper de Text-to-Speech usando a API nativa do navegador

let vozesDisponiveis = [];

// Ordem de preferência de vozes (melhor → pior)
const PREFERENCIA_VOZES = [
  'Microsoft Zira',       // Windows (EUA, feminina) — a melhor disponível
  'Microsoft Aria',       // Windows 11, neural
  'Microsoft Jenny',      // Windows 11, neural
  'Google US English',    // Chrome nativo
  'Microsoft David',      // Windows (EUA, masculina)
  'Microsoft Mark',       // Windows
  'Samantha',             // macOS
  'Karen',                // macOS
];

// Carrega as vozes do sistema (algumas demoram pra aparecer)
export function carregarVozes() {
  return new Promise((resolve) => {
    const vozes = speechSynthesis.getVoices();
    if (vozes.length > 0) {
      vozesDisponiveis = vozes;
      resolve(vozes);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        vozesDisponiveis = speechSynthesis.getVoices();
        resolve(vozesDisponiveis);
      };
    }
  });
}

// Escolhe a melhor voz em inglês seguindo a ordem de preferência
function acharMelhorVoz() {
  if (vozesDisponiveis.length === 0) {
    vozesDisponiveis = speechSynthesis.getVoices();
  }

  // 1) Tenta achar na ordem de preferência (com match parcial no nome)
  for (const nomePreferido of PREFERENCIA_VOZES) {
    const encontrada = vozesDisponiveis.find(
      v => v.lang.startsWith('en') && v.name.includes(nomePreferido)
    );
    if (encontrada) return encontrada;
  }

  // 2) Se não achou, pega qualquer voz en-US
  const enUS = vozesDisponiveis.find(v => v.lang === 'en-US');
  if (enUS) return enUS;

  // 3) Qualquer voz em inglês
  const qualquerIngles = vozesDisponiveis.find(v => v.lang.startsWith('en'));
  if (qualquerIngles) return qualquerIngles;

  // 4) Não achou nada em inglês — retorna null (vai usar padrão do sistema)
  return null;
}

// Fala um texto em inglês
export function falar(texto, velocidade = 0.7) {
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'en-US';
  utterance.rate = velocidade;   // 0.9 = um pouco devagar, mais natural pra aprender
  utterance.pitch = 0.9;
  utterance.volume = 0.9;

  const voz = acharMelhorVoz();
  if (voz) {
    utterance.voice = voz;
    console.log(`[TTS] Usando voz: ${voz.name}`);
  } else {
    console.warn('[TTS] Nenhuma voz em inglês encontrada. Usando padrão do sistema.');
  }

  speechSynthesis.speak(utterance);
}

// Retorna a lista de vozes em inglês disponíveis
export function listarVozesIngles() {
  if (vozesDisponiveis.length === 0) {
    vozesDisponiveis = speechSynthesis.getVoices();
  }
  return vozesDisponiveis.filter(v => v.lang.startsWith('en'));
}

// Retorna o nome da voz que está sendo usada
export function nomeVozAtual() {
  const voz = acharMelhorVoz();
  return voz ? voz.name : 'Nenhuma voz em inglês';
}
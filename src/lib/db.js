import Dexie from 'dexie';

export const db = new Dexie('EnglishTutorDB');

db.version(1).stores({
  words: '++id, english, portuguese, category, level, nextReview',
  phrases: '++id, english, portuguese, category, level, nextReview',
  settings: 'id, theme, voiceName, voiceRate, dailyGoalMinutes'
});

db.version(2).stores({
  words: '++id, english, portuguese, category, level, nextReview, easeFactor, interval, repetitions',
  phrases: '++id, english, portuguese, category, level, nextReview',
  settings: 'id, theme, voiceName, voiceRate, dailyGoalMinutes'
}).upgrade(async (tx) => {
  await tx.table('words').toCollection().modify((palavra) => {
    if (palavra.easeFactor === undefined) palavra.easeFactor = 2.5;
    if (palavra.interval === undefined) palavra.interval = 0;
    if (palavra.repetitions === undefined) palavra.repetitions = 0;
    if (palavra.correctCount === undefined) palavra.correctCount = 0;
    if (palavra.wrongCount === undefined) palavra.wrongCount = 0;
    if (palavra.nextReview === undefined) palavra.nextReview = Date.now();
  });
});

// ============================
// FUNÇÕES BÁSICAS
// ============================

export async function adicionarPalavra(palavra) {
  return await db.words.add(palavra);
}

export async function listarPalavras() {
  return await db.words.toArray();
}

export async function contarPalavras() {
  return await db.words.count();
}

export async function atualizarPalavra(id, dados) {
  return await db.words.update(id, dados);
}

// ============================
// SRS
// ============================

export async function palavrasParaRevisar() {
  const agora = Date.now();
  return await db.words
    .where('nextReview')
    .belowOrEqual(agora)
    .toArray();
}

export async function palavrasOrdenadasPorRevisao() {
  return await db.words.orderBy('nextReview').toArray();
}

export async function contarParaRevisar() {
  const agora = Date.now();
  return await db.words
    .where('nextReview')
    .belowOrEqual(agora)
    .count();
}

export async function estatisticas() {
  const todas = await db.words.toArray();
  const agora = Date.now();

  return {
    total: todas.length,
    paraRevisar: todas.filter(p => (p.nextReview || 0) <= agora).length,
    dominadas: todas.filter(p => p.repetitions >= 3).length,
    aprendendo: todas.filter(p => p.repetitions > 0 && p.repetitions < 3).length,
    novas: todas.filter(p => p.repetitions === 0).length,
    dificeis: todas.filter(p => p.easeFactor < 2.0).length,
    totalAcertos: todas.reduce((s, p) => s + (p.correctCount || 0), 0),
    totalErros: todas.reduce((s, p) => s + (p.wrongCount || 0), 0)
  };
}

// ============================
// BACKUP / EXPORT / IMPORT
// ============================

export async function exportarDados() {
  const palavras = await db.words.toArray();
  const frases = await db.phrases.toArray();
  const config = await db.settings.toArray();

  return {
    versao: 1,
    dataExportacao: new Date().toISOString(),
    palavras,
    frases,
    config
  };
}

export async function importarDados(dados) {
  if (!dados || !dados.palavras || !Array.isArray(dados.palavras)) {
    throw new Error('Arquivo inválido: não tem lista de palavras.');
  }

  await db.words.clear();
  await db.phrases.clear();
  await db.settings.clear();

  if (dados.palavras.length > 0) {
    await db.words.bulkAdd(dados.palavras);
  }
  if (dados.frases && dados.frases.length > 0) {
    await db.phrases.bulkAdd(dados.frases);
  }
  if (dados.config && dados.config.length > 0) {
    await db.settings.bulkAdd(dados.config);
  }

  return {
    palavras: dados.palavras.length,
    frases: dados.frases?.length || 0,
    config: dados.config?.length || 0
  };
}
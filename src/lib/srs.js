// SRS — Spaced Repetition System (SM-2)
// Decide quando cada palavra deve ser revisada

import { atualizarPalavra } from './db.js';

const UM_DIA = 24 * 60 * 60 * 1000; // milissegundos em um dia

// Estado inicial de uma palavra nova
export const ESTADO_INICIAL = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReview: Date.now(),
  correctCount: 0,
  wrongCount: 0
};

// Função principal: processa uma resposta
// resposta: 'acertei' | 'errei'
export async function processarResposta(palavra, resposta) {
  let { easeFactor, interval, repetitions, correctCount, wrongCount } = palavra;

  // Valores padrão se estiverem indefinidos
  easeFactor = easeFactor ?? 2.5;
  interval = interval ?? 0;
  repetitions = repetitions ?? 0;
  correctCount = correctCount ?? 0;
  wrongCount = wrongCount ?? 0;

  let novoInterval;
  let novasRepeticoes;
  let novoEase;

  if (resposta === 'acertei') {
    // Acertou → aumenta repetições e intervalo
    novasRepeticoes = repetitions + 1;

    if (novasRepeticoes === 1) {
      novoInterval = 1;
    } else if (novasRepeticoes === 2) {
      novoInterval = 6;
    } else {
      novoInterval = Math.round(interval * easeFactor);
    }

    // easeFactor aumenta levemente ao acertar (até 2.5 máximo)
    novoEase = Math.min(easeFactor + 0.1, 2.5);
    correctCount++;

  } else {
    // Errou → reseta
    novasRepeticoes = 0;
    novoInterval = 1;
    // easeFactor diminui (a palavra é mais difícil)
    novoEase = Math.max(easeFactor - 0.2, 1.3);
    wrongCount++;
  }

  const agora = Date.now();
  const proximaRevisao = agora + novoInterval * UM_DIA;

  const dadosAtualizados = {
    easeFactor: novoEase,
    interval: novoInterval,
    repetitions: novasRepeticoes,
    nextReview: proximaRevisao,
    correctCount,
    wrongCount
  };

  // Salva no banco
  await atualizarPalavra(palavra.id, dadosAtualizados);

  return dadosAtualizados;
}

// Calcula quando a palavra vai voltar (em texto amigável)
export function previsaoProximaRevisao(palavra, resposta) {
  const { easeFactor = 2.5, interval = 0, repetitions = 0 } = palavra;

  if (resposta === 'errei') {
    return 'volta em 1 dia';
  }

  const novasRepeticoes = repetitions + 1;
  let novoInterval;

  if (novasRepeticoes === 1) {
    novoInterval = 1;
  } else if (novasRepeticoes === 2) {
    novoInterval = 6;
  } else {
    novoInterval = Math.round(interval * easeFactor);
  }

  if (novoInterval === 1) return 'volta em 1 dia';
  if (novoInterval < 30) return `volta em ${novoInterval} dias`;

  const meses = Math.round(novoInterval / 30);
  return `volta em ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}
import { db } from './db.js';

// Lista de 20 palavras iniciais
const palavrasIniciais = [
  { english: 'house',      portuguese: 'casa',       category: 'básico',  level: 1 },
  { english: 'car',        portuguese: 'carro',      category: 'básico',  level: 1 },
  { english: 'book',       portuguese: 'livro',      category: 'básico',  level: 1 },
  { english: 'water',      portuguese: 'água',       category: 'básico',  level: 1 },
  { english: 'food',       portuguese: 'comida',     category: 'básico',  level: 1 },
  { english: 'dog',        portuguese: 'cachorro',   category: 'animais', level: 1 },
  { english: 'cat',        portuguese: 'gato',       category: 'animais', level: 1 },
  { english: 'bird',       portuguese: 'pássaro',    category: 'animais', level: 1 },
  { english: 'friend',     portuguese: 'amigo',      category: 'pessoas', level: 1 },
  { english: 'family',     portuguese: 'família',    category: 'pessoas', level: 1 },
  { english: 'work',       portuguese: 'trabalho',   category: 'rotina',  level: 1 },
  { english: 'school',     portuguese: 'escola',     category: 'rotina',  level: 1 },
  { english: 'morning',    portuguese: 'manhã',      category: 'tempo',   level: 1 },
  { english: 'night',      portuguese: 'noite',      category: 'tempo',   level: 1 },
  { english: 'today',      portuguese: 'hoje',       category: 'tempo',   level: 1 },
  { english: 'tomorrow',   portuguese: 'amanhã',     category: 'tempo',   level: 1 },
  { english: 'happy',      portuguese: 'feliz',      category: 'emoções', level: 1 },
  { english: 'sad',        portuguese: 'triste',     category: 'emoções', level: 1 },
  { english: 'big',        portuguese: 'grande',     category: 'adjetivos', level: 1 },
  { english: 'small',      portuguese: 'pequeno',    category: 'adjetivos', level: 1 }
];

// Função que popula o banco (só se estiver vazio)
export async function popularBanco() {
  const total = await db.words.count();

  if (total === 0) {
    console.log('Banco vazio, adicionando palavras iniciais...');
    await db.words.bulkAdd(palavrasIniciais);
    console.log('20 palavras adicionadas!');
  } else {
    console.log(`Banco já tem ${total} palavras. Nada a fazer.`);
  }
}
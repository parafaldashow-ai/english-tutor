// Professor IA — camada de respostas pré-escritas
// Funciona 100% offline

// Cada "resposta" tem palavras-chave que a ativam
const RESPOSTAS = [
  {
    chaves: ['hello', 'hi', 'hey', 'oi', 'olá'],
    respostas: [
      'Hello! How are you today?',
      'Hi there! Nice to see you. How are you?',
      'Hey! Ready to practice some English?'
    ]
  },
  {
    chaves: ['fine', 'good', 'great', 'ok', 'bem', 'bom', 'ótimo'],
    respostas: [
      'Great to hear! What did you do today?',
      'Awesome! Tell me more about your day.',
      'That\'s good! Did you study English today?'
    ]
  },
  {
    chaves: ['bad', 'sad', 'tired', 'triste', 'cansado'],
    respostas: [
      'I\'m sorry to hear that. What happened?',
      'Oh no! Do you want to talk about it?',
      'That\'s not good. Maybe some English practice will help!'
    ]
  },
  {
    chaves: ['name', 'nome', 'chamo'],
    respostas: [
      'Nice to meet you! I\'m your English tutor.',
      'Great! I\'m here to help you practice English.',
      'Cool! How long have you been studying English?'
    ]
  },
  {
    chaves: ['study', 'studying', 'estudar', 'estudando'],
    respostas: [
      'Excellent! How long do you study every day?',
      'That\'s great! What\'s your favorite way to study?',
      'Keep it up! Consistency is the key to fluency.'
    ]
  },
  {
    chaves: ['work', 'trabalho', 'trabalhar'],
    respostas: [
      'What do you do for work?',
      'Interesting! Do you use English at work?',
      'Nice! Is your job related to English?'
    ]
  },
  {
    chaves: ['english', 'inglês', 'inglês'],
    respostas: [
      'English is a great language to learn! Why do you want to learn it?',
      'Awesome! Practice a little every day and you\'ll improve fast.',
      'That\'s cool! What\'s the hardest part for you?'
    ]
  },
  {
    chaves: ['yes', 'sim', 'yeah', 'yep'],
    respostas: [
      'Great! Tell me more.',
      'Nice! Can you give me an example?',
      'OK! Let\'s continue.'
    ]
  },
  {
    chaves: ['no', 'não', 'nope'],
    respostas: [
      'OK, no problem. What would you like to talk about?',
      'That\'s fine. Let\'s try something else.',
      'No worries! What are you interested in?'
    ]
  },
  {
    chaves: ['thank', 'thanks', 'obrigado', 'valeu'],
    respostas: [
      'You\'re welcome! Keep practicing!',
      'Anytime! You\'re doing great.',
      'My pleasure! Let\'s continue.'
    ]
  },
  {
    chaves: ['bye', 'goodbye', 'tchau', 'até'],
    respostas: [
      'Goodbye! See you next time!',
      'Bye! Keep studying every day.',
      'Take care! Come back soon to practice.'
    ]
  }
];

// Respostas padrão quando não reconhece nada
const RESPOSTAS_PADRAO = [
  'Interesting! Can you tell me more?',
  'I see. What else?',
  'Cool! What do you think about that?',
  'Nice! Tell me more about it.',
  'That\'s interesting! Can you say it in a different way?',
  'OK! Let\'s keep talking. What else would you like to say?'
];

// Verifica se uma palavra-chave está na mensagem
function contemChave(mensagem, chaves) {
  const msgLower = mensagem.toLowerCase();
  return chaves.some((chave) => msgLower.includes(chave));
}

// Gera uma resposta baseada na mensagem do usuário
export function responder(mensagem) {
  for (const item of RESPOSTAS) {
    if (contemChave(mensagem, item.chaves)) {
      const resposta = item.respostas[Math.floor(Math.random() * item.respostas.length)];
      return {
        texto: resposta,
        correspondencia: 'exata'
      };
    }
  }

  // Não achou nada — resposta padrão
  const resposta = RESPOSTAS_PADRAO[Math.floor(Math.random() * RESPOSTAS_PADRAO.length)];
  return {
    texto: resposta,
    correspondencia: 'padrao'
  };
}

// Sugestões de início de conversa
export const SUGESTOES_INICIAIS = [
  'Hello!',
  'My name is...',
  'I want to study English',
  'How are you?'
];
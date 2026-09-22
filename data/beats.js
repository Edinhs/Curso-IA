/**
 * Narrative beats — the authored content of the journey.
 *
 * A *beat* is one station on the timeline: one screen of copy, one node in the
 * 3D corridor, one step of the mind map. Chapters are made of beats, and the
 * whole interface is generated from this array. Adding a beat is the only
 * thing an author has to do to extend the course.
 *
 * Shape
 *   id          stable identifier (used for deep links and progress)
 *   chapterId   → data/chapters.js
 *   era         → data/eras.js
 *   depth       0..1, position along the time axis. Beats must be ordered.
 *   year        optional display year, rendered very large
 *   eyebrow     small mono line above the title (source, author, period)
 *   title       the beat headline
 *   lead        one sentence that must survive on its own
 *
 *   essential   ESSENTIAL layer — always visible
 *   deepDive    ENGINEERING DEEP DIVE layer — behind a toggle
 *   copilot     COPILOT layer — `surface: 'inline'` shows it next to the
 *               essential copy, `'deepdive'` tucks it inside the panel
 *
 *   mindmap     ids from data/mindmap.js unlocked when the beat is reached
 *   lab         id of an interactive module (js/core/registry.js). Renders a
 *               labelled placeholder while the module does not exist yet.
 *
 * Inline emphasis: wrap a phrase in [[double brackets]] to highlight it.
 * The renderer escapes everything else, so copy is never raw HTML.
 *
 * NOTE — This is provisional content for the vertical slice. It exists to
 * validate narrative rhythm and architecture, not to be the final script.
 */
(function (AIC) {
  'use strict';

  AIC.data.beats = [
    {
      id: 'turing-1950',
      chapterId: 'ch01',
      era: 'origins',
      depth: 0.08,
      year: '1950',
      eyebrow: 'Alan Turing · Computing Machinery and Intelligence',
      title: 'Turing troca a pergunta',
      lead: 'A pergunta que abre o campo não é sobre tecnologia. É sobre o que aceitamos como prova.',
      essential: {
        marker: 'concept',
        body: [
          'Turing percebeu que "uma máquina pode pensar?" é uma pergunta impossível de responder, porque ninguém consegue definir "pensar" de forma verificável.',
          'Em vez de responder, ele [[trocou a pergunta]]: se uma máquina conversa de modo indistinguível de uma pessoa, em que ponto a distinção ainda importa?'
        ]
      },
      deepDive: {
        title: 'Por que isso ainda é uma decisão de engenharia',
        intro: 'Turing substituiu um problema filosófico por um critério observável — exatamente o que fazemos ao definir um critério de aceitação.',
        flow: [
          { label: 'Pergunta ambígua', note: '"a máquina pensa?"' },
          { label: 'Critério observável', note: 'comportamento medível' },
          { label: 'Protocolo de teste', note: 'o jogo da imitação' },
          { label: 'Avaliação empírica', note: 'resultado discutível, mas verificável' }
        ],
        notes: [
          'O teste de Turing nunca foi uma métrica de qualidade: é um argumento sobre o que conta como evidência.',
          'Toda vez que você define "a saída está correta quando…", está repetindo esse movimento.'
        ]
      },
      copilot: {
        surface: 'deepdive',
        title: 'No dia a dia com o Copilot',
        body: 'Avaliar uma resposta do Microsoft 365 Copilot é o mesmo exercício: sem um critério explícito de sucesso, a avaliação vira impressão pessoal.',
        example: 'Antes de pedir, escreva o que tornaria a resposta aceitável.'
      },
      mindmap: ['ai'],
      lab: null
    },

    {
      id: 'dartmouth-1956',
      chapterId: 'ch01',
      era: 'origins',
      depth: 0.3,
      year: '1956',
      eyebrow: 'Dartmouth Summer Research Project',
      title: 'O campo ganha um nome',
      lead: 'Dez pesquisadores, oito semanas de verão e a proposta de que a inteligência poderia ser descrita com precisão suficiente para ser simulada.',
      essential: {
        marker: 'concept',
        body: [
          'Foi em Dartmouth que o termo [[Artificial Intelligence]] apareceu pela primeira vez, em uma proposta de financiamento.',
          'A aposta inicial era simbólica: representar conhecimento em regras explícitas e deixar a máquina raciocinar sobre elas. Funcionou — dentro de domínios pequenos.'
        ]
      },
      deepDive: {
        title: 'A era simbólica e seu teto',
        intro: 'Sistemas especialistas dominaram três décadas. O limite não foi de hardware: foi de manutenção.',
        flow: [
          { label: 'Especialista humano', note: 'conhecimento tácito' },
          { label: 'Engenheiro de conhecimento', note: 'entrevista e formaliza' },
          { label: 'Base de regras', note: 'SE … ENTÃO …' },
          { label: 'Motor de inferência', note: 'encadeia regras' },
          { label: 'Teto', note: 'o mundo tem exceções demais' }
        ],
        notes: [
          'Cada exceção nova exigia uma regra nova, escrita à mão, por alguém que entendesse o domínio inteiro.',
          'O conhecimento não escalava — e essa frustração é exatamente o que abre espaço para o aprendizado estatístico.'
        ]
      },
      copilot: {
        surface: 'deepdive',
        title: 'Por que isso importa agora',
        body: 'Regras explícitas continuam superiores quando o domínio é fechado e auditável. Um LLM não substitui uma norma de homologação.',
        example: 'Use o Copilot para interpretar a norma, não para inventá-la.'
      },
      mindmap: ['ai', 'symbolic'],
      lab: null
    },

    {
      id: 'machine-learning',
      chapterId: 'ch02',
      era: 'learning',
      depth: 0.56,
      year: null,
      eyebrow: 'Anos 1990 — 2010 · a virada estatística',
      title: 'Aprender em vez de programar',
      lead: 'Em vez de descrever o padrão, passamos a mostrar exemplos e deixar o sistema derivar o padrão sozinho.',
      essential: {
        marker: 'concept',
        body: [
          'Machine Learning inverte a direção do trabalho: você não escreve a regra, você fornece [[dados rotulados]] e o algoritmo ajusta parâmetros até acertar.',
          'O programa deixa de ser uma lista de instruções e passa a ser um conjunto de números que minimizam um erro.'
        ]
      },
      deepDive: {
        title: 'O ciclo que não mudou desde então',
        intro: 'Redes profundas, transformers e LLMs são variações deste mesmo laço, com mais dados e mais parâmetros.',
        flow: [
          { label: 'Dados', note: 'exemplos do mundo real' },
          { label: 'Features', note: 'o que o modelo enxerga' },
          { label: 'Treino', note: 'ajuste por erro' },
          { label: 'Modelo', note: 'parâmetros congelados' },
          { label: 'Inferência', note: 'previsão sobre dado novo' }
        ],
        notes: [
          'Deep Learning é o mesmo laço com as features aprendidas pelo próprio modelo, camada após camada.',
          'A qualidade do resultado é limitada pelos dados, não pela arquitetura — um viés no conjunto de treino vira um viés no produto.'
        ]
      },
      copilot: {
        surface: 'inline',
        title: 'Leitura prática',
        body: 'Um modelo não "sabe" o processo da sua área: ele reconhece padrões parecidos com os que viu. Por isso contexto vale mais que instrução.',
        example: null
      },
      mindmap: ['ml', 'deep-learning'],
      lab: 'ml-loop'
    },

    {
      id: 'transformer-2017',
      chapterId: 'ch03',
      era: 'language',
      depth: 0.84,
      year: '2017',
      eyebrow: 'Vaswani et al. · Attention Is All You Need',
      title: 'Attention is all you need',
      lead: 'Um artigo de oito páginas dissolve o gargalo sequencial e torna a escala economicamente viável.',
      essential: {
        marker: 'concept',
        body: [
          'Modelos anteriores liam texto palavra por palavra, em ordem. O Transformer olha para a sequência inteira de uma vez e decide, para cada posição, [[quais outras posições importam]].',
          'Isso é atenção — e é o que permite treinar em paralelo, em escala, sobre bilhões de exemplos.'
        ]
      },
      deepDive: {
        title: 'Do texto ao vetor',
        intro: 'Todo o resto do curso vive dentro deste caminho. Vamos percorrê-lo com calma nos capítulos 04 a 06.',
        flow: [
          { label: 'Text', note: 'a frase que você escreve' },
          { label: 'Tokenizer', note: 'quebra em unidades' },
          { label: 'Token IDs', note: 'números de um vocabulário' },
          { label: 'Embedding', note: 'vetores com significado' },
          { label: 'Transformer', note: 'atenção sobre o contexto' }
        ],
        notes: [
          'O modelo nunca vê letras nem palavras: vê índices e, logo depois, vetores.',
          'Custo, limite de contexto e cobrança de API são todos medidos em tokens — por isso o capítulo 04 existe.'
        ]
      },
      copilot: {
        surface: 'deepdive',
        title: 'Onde o Copilot entra',
        body: 'O Microsoft 365 Copilot usa esse mesmo caminho, mas injeta antes dele o conteúdo recuperado do Microsoft Graph a que você tem acesso.',
        example: 'Capítulos 08 e 09 tratam de grounding e arquitetura.'
      },
      mindmap: ['transformer', 'llm'],
      lab: 'attention-simulator'
    }
  ];

  AIC.data.getBeat = function (id) {
    return AIC.data.beats.filter(function (beat) { return beat.id === id; })[0] || null;
  };
})(window.AIC);

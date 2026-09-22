/**
 * Narrative beats — the authored content of the journey.
 *
 * A *beat* is one station: one coordinate in space, one construct, one
 * question, one step of the mind map. The whole interface is generated from
 * this array — adding a beat is the only thing an author has to do.
 *
 * ── The narrative shape ───────────────────────────────────────────────────
 * Every beat runs the same five moves, and they chain: a beat's
 * `nextQuestion` is the following beat's `question`. That chain is what turns
 * a list of facts into a story you can follow without being told it.
 *
 *   question      what we could not answer yet
 *   discovery     what turned out to be true
 *   concept       the thing that got a name — the term is [[highlighted]]
 *   connection    what it cost, or what it left unsolved
 *   nextQuestion  the door it opened
 *
 * Copy is short on purpose. One idea per line, no paragraphs. Depth belongs in
 * `deepDive`, which is one click away and can be as technical as it needs to
 * be. Simplicity here means clarity, not superficiality.
 *
 * ── Fields ────────────────────────────────────────────────────────────────
 *   id          stable identifier, used for deep links and progress
 *   chapterId   → data/chapters.js
 *   era         → data/eras.js
 *   depth       0..1, position on the time axis. Beats must be ordered.
 *   coordinate  the station's position in time, rendered at hero scale on
 *               arrival. A year, a decade, a range — every station has one,
 *               because arrival is what makes a station a place.
 *   source      small technical line: the paper, the room, the decade
 *   term        the concept's name, set as a technical label
 *   construct   → js/scene/constructs/. The concept's form in space.
 *   deepDive    ENGINEERING layer, behind a toggle
 *   copilot     COPILOT layer — `surface: 'inline'` or `'deepdive'`
 *   mindmap     ids from data/mindmap.js unlocked here
 *   lab         id of an interactive module (js/core/registry.js)
 *
 * Language: Portuguese prose, English for the terms the industry uses in
 * English. Translating "Machine Learning" would help nobody.
 *
 * NOTE — provisional content for the vertical slice. It exists to validate
 * narrative rhythm and architecture, not as the final script.
 */
(function (AIC) {
  'use strict';

  AIC.data.beats = [
    {
      id: 'turing-1950',
      chapterId: 'ch01',
      era: 'origins',
      depth: 0.08,
      coordinate: '1950',
      source: 'Alan Turing · Computing Machinery and Intelligence',
      term: 'Imitation Game',
      construct: 'turing-gate',

      question: 'Uma máquina pode pensar?',
      essential: {
        marker: 'concept',
        discovery: 'A pergunta não tem resposta. Ninguém consegue definir "pensar" de forma verificável.',
        concept: 'Turing troca a pergunta por outra, observável: a máquina se comporta de modo [[indistinguível]] de uma pessoa?',
        connection: 'Filosofia vira critério de aceitação. É o mesmo movimento que você faz ao escrever um caso de teste.'
      },
      nextQuestion: 'E o que exatamente vamos construir?',

      deepDive: {
        title: 'A troca que ainda fazemos',
        intro: 'Turing substituiu um problema insolúvel por um critério observável. Todo requisito de engenharia repete esse movimento.',
        flow: [
          { label: 'Pergunta ambígua', note: 'a máquina pensa?' },
          { label: 'Critério observável', note: 'comportamento medível' },
          { label: 'Protocolo', note: 'o jogo da imitação' },
          { label: 'Avaliação', note: 'discutível, mas verificável' }
        ],
        notes: [
          'O teste nunca foi uma métrica de qualidade: é um argumento sobre o que conta como evidência.',
          'Sem critério explícito, avaliação vira opinião — com IA generativa isso custa caro.'
        ]
      },
      copilot: {
        surface: 'deepdive',
        title: 'No dia a dia',
        body: 'Antes de pedir algo ao Copilot, escreva o que tornaria a resposta aceitável. Sem isso, você não está avaliando — está reagindo.',
        example: null
      },

      mindmap: ['ai'],
      lab: null
    },

    {
      id: 'dartmouth-1956',
      chapterId: 'ch01',
      era: 'origins',
      depth: 0.3,
      coordinate: '1956',
      source: 'Dartmouth Summer Research Project',
      term: 'Artificial Intelligence',
      construct: 'dartmouth-split',

      question: 'E o que exatamente vamos construir?',
      essential: {
        marker: 'concept',
        discovery: 'Dez pesquisadores, oito semanas de verão, e uma proposta de financiamento que precisava de um nome.',
        concept: 'O nome foi [[Artificial Intelligence]]. A aposta: descrever conhecimento em regras explícitas e deixar a máquina raciocinar sobre elas.',
        connection: 'Funcionou — em domínios pequenos. Cada exceção nova exigia uma regra nova, escrita à mão.'
      },
      nextQuestion: 'E se a máquina descobrisse as regras sozinha?',

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
          'O conhecimento não escalava: manter a base custava mais do que construí-la.',
          'Regras explícitas continuam superiores quando o domínio é fechado e auditável — uma norma de homologação não é trabalho para um LLM.'
        ]
      },
      copilot: {
        surface: 'deepdive',
        title: 'Onde a regra ainda vence',
        body: 'Use o Copilot para interpretar a norma, nunca para inventá-la. O determinismo é uma funcionalidade, não uma limitação.',
        example: null
      },

      mindmap: ['symbolic'],
      lab: null
    },

    {
      id: 'machine-learning',
      chapterId: 'ch02',
      era: 'learning',
      depth: 0.56,
      coordinate: '1990s',
      source: 'A virada estatística · 1990 — 2010',
      term: 'Machine Learning',
      construct: 'learning-lattice',

      question: 'E se a máquina descobrisse as regras sozinha?',
      essential: {
        marker: 'concept',
        discovery: 'Em vez de descrever o padrão, mostramos exemplos. O sistema deriva o padrão.',
        concept: 'O programa deixa de ser uma lista de instruções e passa a ser um conjunto de [[parâmetros]] que minimizam um erro.',
        connection: 'O limite muda de lugar: sai do conhecimento e vai para os dados — e para a capacidade de processá-los.'
      },
      nextQuestion: 'Como olhar para uma sequência inteira de uma vez?',

      deepDive: {
        title: 'O ciclo que não mudou desde então',
        intro: 'Deep Learning, Transformers e LLMs são variações deste mesmo laço, com mais dados e mais parâmetros.',
        flow: [
          { label: 'Dados', note: 'exemplos do mundo real' },
          { label: 'Features', note: 'o que o modelo enxerga' },
          { label: 'Treino', note: 'ajuste por erro' },
          { label: 'Modelo', note: 'parâmetros congelados' },
          { label: 'Inferência', note: 'previsão sobre dado novo' }
        ],
        notes: [
          'Deep Learning é o mesmo laço com as features aprendidas pelo próprio modelo, camada após camada.',
          'O resultado é limitado pelos dados, não pela arquitetura: um viés no conjunto de treino vira um viés no produto.'
        ]
      },
      copilot: {
        surface: 'inline',
        title: 'Leitura prática',
        body: 'Um modelo não conhece o seu processo. Ele reconhece padrões parecidos com os que viu — por isso contexto vale mais que instrução.',
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
      coordinate: '2017',
      source: 'Vaswani et al. · Attention Is All You Need',
      term: 'Transformer',
      construct: 'attention-web',

      question: 'Como olhar para uma sequência inteira de uma vez?',
      essential: {
        marker: 'concept',
        discovery: 'Modelos anteriores liam palavra por palavra, em ordem. O gargalo não era o tamanho do modelo: era a fila.',
        concept: 'A resposta é [[attention]]: cada posição decide, sozinha, quais outras posições importam para ela.',
        connection: 'Sem fila, o treino paraleliza. É isso que torna a escala economicamente viável — e os LLMs possíveis.'
      },
      nextQuestion: 'Se o modelo só enxerga números, o que exatamente ele lê?',

      deepDive: {
        title: 'Do texto ao vetor',
        intro: 'Todo o resto do curso vive dentro deste caminho. Os capítulos 04 a 06 percorrem cada etapa.',
        flow: [
          { label: 'Text', note: 'a frase que você escreve' },
          { label: 'Tokenizer', note: 'quebra em unidades' },
          { label: 'Token IDs', note: 'índices de um vocabulário' },
          { label: 'Embedding', note: 'vetores com significado' },
          { label: 'Attention', note: 'peso de cada relação' },
          { label: 'Transformer', note: 'camadas empilhadas' }
        ],
        notes: [
          'O modelo nunca vê letras nem palavras: vê índices e, logo depois, vetores.',
          'Custo, limite de contexto e cobrança de API são todos medidos em tokens — por isso o capítulo 04 existe.'
        ]
      },
      copilot: {
        surface: 'deepdive',
        title: 'Onde o Copilot entra',
        body: 'O Microsoft 365 Copilot percorre esse mesmo caminho, mas injeta antes dele o conteúdo recuperado do Microsoft Graph a que você tem acesso.',
        example: 'Capítulos 08 e 09: grounding e arquitetura.'
      },

      mindmap: ['transformer', 'llm'],
      lab: 'attention-simulator'
    }
  ];

  AIC.data.getBeat = function (id) {
    return AIC.data.beats.filter(function (beat) { return beat.id === id; })[0] || null;
  };
})(window.AIC);

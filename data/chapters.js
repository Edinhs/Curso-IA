/**
 * The twelve chapters of the course (~30 min each).
 *
 * Only metadata lives here. Narrative content is authored as *beats* in
 * `data/beats.js` and linked back by `chapterId`. A chapter with no beats yet
 * is simply listed as `planned` — the interface renders it without complaint,
 * which is how the course grows without a rebuild.
 *
 * Shape:
 *   id          stable identifier, referenced by beats
 *   number      display label ("01")
 *   title       chapter title
 *   summary     one line, used in the journey index
 *   era         which of the six eras it belongs to
 *   status      'preview'  — has authored beats in this vertical slice
 *               'planned'  — reserved, content to come
 *   labs        interactive modules planned for the chapter (see js/core/registry.js)
 */
(function (AIC) {
  'use strict';

  AIC.data.chapters = [
    {
      id: 'ch01', number: '01', era: 'origins', status: 'preview',
      title: 'O nascimento da Inteligência Artificial',
      summary: 'De Turing a Dartmouth: como uma pergunta virou um campo.',
      labs: []
    },
    {
      id: 'ch02', number: '02', era: 'learning', status: 'preview',
      title: 'Machine Learning',
      summary: 'Aprender padrões a partir de dados em vez de regras escritas à mão.',
      labs: ['ml-loop']
    },
    {
      id: 'ch03', number: '03', era: 'learning', status: 'preview',
      title: 'Redes neurais e Transformers',
      summary: 'Camadas, atenção e a arquitetura que destravou a escala.',
      labs: ['attention-simulator']
    },
    {
      id: 'ch04', number: '04', era: 'language', status: 'planned',
      title: 'Tokens',
      summary: 'A unidade mínima que o modelo realmente enxerga.',
      labs: ['tokenizer-lab', 'next-token-game']
    },
    {
      id: 'ch05', number: '05', era: 'language', status: 'planned',
      title: 'Embeddings',
      summary: 'Significado como posição em um espaço vetorial.',
      labs: ['embedding-space-3d']
    },
    {
      id: 'ch06', number: '06', era: 'language', status: 'planned',
      title: 'Large Language Models',
      summary: 'Escala, treinamento e o que um LLM sabe (e não sabe).',
      labs: []
    },
    {
      id: 'ch07', number: '07', era: 'language', status: 'planned',
      title: 'Contexto',
      summary: 'Janela de contexto, memória e o custo de lembrar.',
      labs: ['context-window-meter']
    },
    {
      id: 'ch08', number: '08', era: 'generative', status: 'planned',
      title: 'Hallucination, Grounding e RAG',
      summary: 'Por que o modelo inventa e como ancorá-lo em fontes reais.',
      labs: ['rag-simulator', 'hallucination-challenge']
    },
    {
      id: 'ch09', number: '09', era: 'copilot', status: 'planned',
      title: 'Microsoft 365 Copilot',
      summary: 'Arquitetura, Graph, permissões e uso corporativo responsável.',
      labs: ['copilot-architecture-explorer']
    },
    {
      id: 'ch10', number: '10', era: 'copilot', status: 'planned',
      title: 'Prompt Engineering',
      summary: 'Instrução, contexto, formato e critério de sucesso.',
      labs: ['prompt-builder']
    },
    {
      id: 'ch11', number: '11', era: 'copilot', status: 'planned',
      title: 'IA aplicada à Engenharia',
      summary: 'Casos reais de Infotainment, requisitos, testes e documentação.',
      labs: ['engineering-exercises']
    },
    {
      id: 'ch12', number: '12', era: 'agents', status: 'planned',
      title: 'Agents, futuro e responsabilidade',
      summary: 'Ferramentas, autonomia, supervisão humana e limites.',
      labs: ['agent-simulator']
    }
  ];

  AIC.data.getChapter = function (id) {
    return AIC.data.chapters.filter(function (chapter) { return chapter.id === id; })[0] || null;
  };
})(window.AIC);

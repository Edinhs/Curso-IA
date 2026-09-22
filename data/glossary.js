/**
 * Glossary.
 *
 * Rendered today in the chapter index overlay, as the vocabulary the journey is
 * heading towards. Each entry points at the chapter that will define it
 * properly, so the list doubles as a table of what is still to come.
 *
 * `long` is written for the term-lookup interaction that ships with chapter 04
 * — hover or focus a marked term and read the definition without leaving the
 * beat. Writing it now costs nothing and settles the contract.
 */
(function (AIC) {
  'use strict';

  AIC.data.glossary = [
    {
      term: 'Token',
      chapterId: 'ch04',
      short: 'Unidade mínima de texto que o modelo processa — geralmente um pedaço de palavra.',
      long: 'Modelos não leem letras nem palavras: leem índices de um vocabulário fixo. "Infotainment" pode virar três ou quatro tokens. Contexto, custo e limite de resposta são todos medidos nessa unidade.'
    },
    {
      term: 'Embedding',
      chapterId: 'ch05',
      short: 'Representação de um token como vetor numérico em um espaço de significado.',
      long: 'Termos com uso parecido ficam próximos nesse espaço. É o que permite buscar por sentido em vez de por palavra exata — a base técnica do RAG.'
    },
    {
      term: 'Grounding',
      chapterId: 'ch08',
      short: 'Ancorar a resposta do modelo em fontes verificáveis fornecidas no prompt.',
      long: 'Sem grounding o modelo responde a partir do que aprendeu no treino. Com grounding, ele responde a partir de documentos recuperados — e pode citá-los.'
    },
    {
      term: 'Janela de contexto',
      chapterId: 'ch07',
      short: 'Quantidade máxima de tokens que o modelo consegue considerar de uma vez.',
      long: 'Tudo o que não cabe na janela simplesmente não existe para o modelo naquela requisição: nem a instrução, nem o documento, nem o histórico da conversa.'
    }
  ];
})(window.AIC);

/**
 * The progressive mind map.
 *
 * Nodes are declared once, as a flat list with a `parent` pointer. They stay
 * hidden until a beat unlocks them (see `mindmap` on each beat), so the map
 * grows with the learner instead of spoiling the route.
 *
 * Layout is computed from the tree — authors never position anything by hand.
 * Nodes without a `branch` flag form the spine, in declaration order; a node
 * marked `branch: 'left' | 'right'` hangs off its parent instead of continuing
 * the trunk.
 * Nodes that no beat unlocks yet are still declared: they render as the faint
 * "ainda por vir" outline, which is what makes the map feel like a map.
 */
(function (AIC) {
  'use strict';

  AIC.data.mindmap = {
    rootId: 'ai',
    nodes: [
      { id: 'ai', parent: null, label: 'AI', note: 'O campo', era: 'origins' },
      { id: 'symbolic', parent: 'ai', label: 'Symbolic AI', note: 'Regras explícitas', era: 'origins', branch: 'left' },
      { id: 'ml', parent: 'ai', label: 'Machine Learning', note: 'Aprender com dados', era: 'learning' },
      { id: 'deep-learning', parent: 'ml', label: 'Deep Learning', note: 'Features aprendidas', era: 'learning' },
      { id: 'transformer', parent: 'deep-learning', label: 'Transformer', note: 'Atenção', era: 'language' },
      { id: 'llm', parent: 'transformer', label: 'LLM', note: 'Escala + linguagem', era: 'language' },
      { id: 'generative', parent: 'llm', label: 'Generative AI', note: 'Produzir, não classificar', era: 'generative' },
      { id: 'rag', parent: 'generative', label: 'RAG', note: 'Ancorar em fontes', era: 'generative' },
      { id: 'copilot', parent: 'rag', label: 'M365 Copilot', note: 'IA no fluxo de trabalho', era: 'copilot' },
      { id: 'agents', parent: 'copilot', label: 'Agents', note: 'Autonomia supervisionada', era: 'agents' }
    ]
  };
})(window.AIC);

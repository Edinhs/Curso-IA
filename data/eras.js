/**
 * The six movements of the journey.
 *
 * An era drives three things at once: the label in the progress rail, the
 * colour temperature of the 3D corridor, and the grouping of chapters. The
 * arc runs cold (a mathematical question) → warm (generative breakthrough) →
 * cool and structured (agents), which is why the hues are not a rainbow.
 *
 * `span` is the slice of the timeline (0..1) this era occupies, authored
 * alongside the `depth` values in data/beats.js. The progress rail draws the
 * six eras as equal segments — it is a map of the twelve-chapter course, not of
 * how much of it this demonstration happens to cover — and uses `span` to place
 * the cursor inside the right segment.
 */
(function (AIC) {
  'use strict';

  AIC.data.eras = [
    {
      id: 'origins',
      span: [0.00, 0.40],
      label: 'ORIGINS',
      title: 'A pergunta',
      caption: 'De uma pergunta filosófica a um campo de pesquisa.',
      accent: '#8FA7C4'
    },
    {
      id: 'learning',
      span: [0.40, 0.68],
      label: 'LEARNING',
      title: 'O aprendizado',
      caption: 'Máquinas deixam de seguir regras e passam a derivá-las.',
      accent: '#74A9C9'
    },
    {
      id: 'language',
      span: [0.68, 0.90],
      label: 'LANGUAGE',
      title: 'A linguagem',
      caption: 'Atenção, tokens e vetores transformam texto em cálculo.',
      accent: '#5FC0C0'
    },
    {
      id: 'generative',
      span: [0.90, 0.94],
      label: 'GENERATIVE AI',
      title: 'A geração',
      caption: 'O modelo deixa de classificar e passa a produzir.',
      accent: '#D2A163'
    },
    {
      id: 'copilot',
      span: [0.94, 0.98],
      label: 'COPILOT',
      title: 'O copiloto',
      caption: 'A IA entra no fluxo de trabalho corporativo.',
      accent: '#8D9BE6'
    },
    {
      id: 'agents',
      span: [0.98, 1.00],
      label: 'AGENTS',
      title: 'A autonomia',
      caption: 'Do assistente que responde ao agente que executa.',
      accent: '#A88CDD'
    }
  ];

  AIC.data.getEra = function (id) {
    return AIC.data.eras.filter(function (era) { return era.id === id; })[0] || null;
  };
})(window.AIC);

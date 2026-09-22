/**
 * The six movements of the journey.
 *
 * An era is a movement of the journey: a label in the progress rail, a
 * *signature* tint, and a slice of the timeline.
 *
 * The signatures sit inside a deliberately narrow band — six low-saturation
 * tints at the same lightness, not six colours. The identity has to stay one
 * identity across twelve chapters. GENERATIVE is the single warm signature,
 * and that break is doing narrative work: it marks the point where machines
 * stopped classifying and started producing.
 *
 * The signature is never washed over the whole scene. It reaches the active
 * concept, the position marker and the highlighted terms; the space itself
 * stays graphite and white.
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
      accent: '#8FA6BE'
    },
    {
      id: 'learning',
      span: [0.40, 0.68],
      label: 'LEARNING',
      title: 'O aprendizado',
      caption: 'Máquinas deixam de seguir regras e passam a derivá-las.',
      accent: '#87A8B8'
    },
    {
      id: 'language',
      span: [0.68, 0.90],
      label: 'LANGUAGE',
      title: 'A linguagem',
      caption: 'Atenção, tokens e vetores transformam texto em cálculo.',
      accent: '#84AAAE'
    },
    {
      id: 'generative',
      span: [0.90, 0.94],
      label: 'GENERATIVE AI',
      title: 'A geração',
      caption: 'O modelo deixa de classificar e passa a produzir.',
      accent: '#BCA98C'
    },
    {
      id: 'copilot',
      span: [0.94, 0.98],
      label: 'COPILOT',
      title: 'O copiloto',
      caption: 'A IA entra no fluxo de trabalho corporativo.',
      accent: '#95A0BE'
    },
    {
      id: 'agents',
      span: [0.98, 1.00],
      label: 'AGENTS',
      title: 'A autonomia',
      caption: 'Do assistente que responde ao agente que executa.',
      accent: '#A198BC'
    }
  ];

  AIC.data.getEra = function (id) {
    return AIC.data.eras.filter(function (era) { return era.id === id; })[0] || null;
  };
})(window.AIC);

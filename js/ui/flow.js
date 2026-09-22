/**
 * Flow diagram.
 *
 *   Text → Tokenizer → Token IDs → Embedding → Transformer
 *
 * Built as a real ordered list with a CSS spine rather than as SVG. A diagram
 * of *labels* has no geometry worth drawing: as a list it stays selectable,
 * reads correctly in a screen reader, reflows on a phone and needs no viewBox
 * maths. The mind map, which does have geometry, is SVG.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;

  AIC.ui.flow = {
    /** @param steps [{ label, note }] */
    create: function (steps, options) {
      var settings = options || {};
      var list = dom.el('ol', {
        class: 'flow' + (settings.class ? ' ' + settings.class : ''),
        'aria-label': settings.label || 'Fluxo de etapas'
      });

      (steps || []).forEach(function (step, index) {
        list.appendChild(dom.el('li', {
          class: 'flow__step',
          style: '--flow-index:' + index,
          children: [
            dom.el('span', { class: 'flow__dot', 'aria-hidden': 'true' }),
            dom.el('span', { class: 'flow__label', text: step.label }),
            step.note ? dom.el('span', { class: 'flow__note', text: step.note }) : null
          ]
        }));
      });

      return list;
    }
  };
})(window.AIC);

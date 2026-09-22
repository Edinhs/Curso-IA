/**
 * The three didactic markers.
 *
 * CONCEPT, ENGINEERING and COPILOT recur across all twelve chapters, so they
 * get a graphic language of their own rather than emoji: a drawn sigil plus a
 * mono label, both tinted by the marker's own hue. The sigils live in the SVG
 * sprite at the top of index.html.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;

  var MARKERS = {
    concept: {
      icon: 'sigil-concept',
      label: 'CONCEPT',
      description: 'Explicação principal'
    },
    engineering: {
      icon: 'sigil-engineering',
      label: 'ENGINEERING',
      description: 'Visão técnica'
    },
    copilot: {
      icon: 'sigil-copilot',
      label: 'COPILOT',
      description: 'Aplicação no Microsoft 365 Copilot'
    }
  };

  AIC.ui.markers = {
    /** @param type one of 'concept' | 'engineering' | 'copilot' */
    create: function (type, options) {
      var marker = MARKERS[type];
      if (!marker) return null;
      var settings = options || {};

      return dom.el('span', {
        class: 'marker marker--' + type + (settings.class ? ' ' + settings.class : ''),
        'data-marker': type,
        title: marker.description,
        children: [
          dom.icon(marker.icon, { class: 'marker__sigil' }),
          dom.el('span', { class: 'marker__label', text: settings.label || marker.label })
        ]
      });
    }
  };
})(window.AIC);

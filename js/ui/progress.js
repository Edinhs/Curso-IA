/**
 * The progress rail.
 *
 * A hairline on the right edge divided into the six eras. Only the era you are
 * in is labelled; the others are ticks. Hover or focus the rail and every label
 * fades in, so the whole map is one gesture away without ever occupying the
 * screen. That restraint is the point — a permanently expanded list of six
 * items down the side of the viewport is a dashboard sidebar.
 *
 * Each era is a real button: click or Enter jumps to its first authored beat.
 * An off-screen live region announces era changes for screen readers, because
 * the cursor moving along a line communicates nothing to them.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var utils = AIC.core.utils;

  function firstBeatOf(eraId) {
    return AIC.data.beats.filter(function (beat) { return beat.era === eraId; })[0] || null;
  }

  /** Journey progress → position on the rail, where all six eras are equal. */
  function railPosition(progress) {
    var eras = AIC.data.eras;
    for (var i = 0; i < eras.length; i += 1) {
      var span = eras[i].span;
      if (progress <= span[1] || i === eras.length - 1) {
        var local = utils.progress(progress, span[0], span[1]);
        return (i + local) / eras.length;
      }
    }
    return 0;
  }

  AIC.ui.progress = {
    mount: function (root, journey) {
      var items = [];

      var list = dom.el('ol', { class: 'rail__list' });
      AIC.data.eras.forEach(function (era, index) {
        var beat = firstBeatOf(era.id);
        var button = dom.el('button', {
          type: 'button',
          class: 'rail__button',
          'data-era': era.id,
          'aria-label': era.label + ' — ' + era.title + (beat ? '' : ' (ainda não disponível)'),
          children: [
            dom.el('span', { class: 'rail__tick', 'aria-hidden': 'true' }),
            dom.el('span', { class: 'rail__label', text: era.label })
          ]
        });

        if (!beat) button.disabled = true;
        else button.addEventListener('click', function () { journey.goTo(beat.id); });

        // Position is written as a resolved percentage: the six eras are drawn
        // as equal segments whatever their timeline span.
        var offset = ((index + 0.5) / AIC.data.eras.length * 100).toFixed(3) + '%';
        var item = dom.el('li', {
          class: 'rail__item',
          style: '--rail-offset:' + offset,
          children: [button]
        });

        list.appendChild(item);
        items.push({ era: era, item: item, button: button });
      });

      var cursor = dom.el('span', { class: 'rail__cursor', 'aria-hidden': 'true' });
      var live = dom.el('p', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });

      var nav = dom.el('nav', {
        class: 'rail',
        'aria-label': 'Progresso da jornada',
        children: [
          dom.el('div', {
            class: 'rail__track',
            children: [dom.el('span', { class: 'rail__line', 'aria-hidden': 'true' }), cursor, list]
          })
        ]
      });

      root.appendChild(nav);
      root.appendChild(live);

      bus.on(events.JOURNEY_PROGRESS, function (payload) {
        nav.style.setProperty('--rail-position', railPosition(payload.progress).toFixed(4));
      });

      bus.on(events.ERA_CHANGE, function (payload) {
        var era = AIC.data.getEra(payload.eraId);
        if (!era) return;

        items.forEach(function (entry) {
          var active = entry.era.id === era.id;
          entry.item.classList.toggle('is-active', active);
          if (active) entry.button.setAttribute('aria-current', 'step');
          else entry.button.removeAttribute('aria-current');
        });

        nav.style.setProperty('--rail-accent', era.accent);
        document.documentElement.style.setProperty('--era-accent', era.accent);
        live.textContent = era.label + ' — ' + era.title + '. ' + era.caption;
      });

      return nav;
    }
  };
})(window.AIC);

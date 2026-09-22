/**
 * Generic overlay panel.
 *
 * Used by the mind map and the chapter index, and ready for anything else that
 * needs to sit above the journey without leaving it. It handles the parts that
 * are easy to get wrong: Escape to close, focus moved into the panel and
 * returned to the trigger afterwards, the rest of the page marked inert for
 * assistive technology, and the page behind kept from scrolling.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;

  var openOverlay = null;

  function focusable(root) {
    return dom.qsa(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      root
    );
  }

  AIC.ui.overlay = {
    create: function (options) {
      var closeButton = dom.el('button', {
        type: 'button',
        class: 'overlay__close',
        'aria-label': 'Fechar',
        children: [dom.icon('close')]
      });

      var body = dom.el('div', { class: 'overlay__body' });

      var panel = dom.el('div', {
        class: 'overlay__panel',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': options.id + '-title',
        children: [
          dom.el('header', {
            class: 'overlay__head',
            children: [
              dom.el('div', {
                class: 'overlay__heading',
                children: [
                  dom.el('p', { class: 'overlay__eyebrow', text: options.eyebrow || '' }),
                  dom.el('h2', { class: 'overlay__title', id: options.id + '-title', text: options.title })
                ]
              }),
              closeButton
            ]
          }),
          body
        ]
      });

      var root = dom.el('div', {
        class: 'overlay',
        id: options.id,
        hidden: 'hidden',
        children: [dom.el('div', { class: 'overlay__scrim' }), panel]
      });

      var lastFocused = null;

      function close() {
        if (openOverlay !== api) return;
        openOverlay = null;
        root.classList.remove('is-open');
        document.documentElement.classList.remove('has-overlay');
        window.setTimeout(function () { if (!root.classList.contains('is-open')) root.hidden = true; }, 220);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        bus.emit(events.OVERLAY_TOGGLE, { id: options.id, open: false });
      }

      function open() {
        if (openOverlay) openOverlay.close();
        lastFocused = document.activeElement;
        root.hidden = false;
        // Next frame, so the transition has a starting state to animate from.
        window.requestAnimationFrame(function () { root.classList.add('is-open'); });
        document.documentElement.classList.add('has-overlay');
        openOverlay = api;
        closeButton.focus();
        bus.emit(events.OVERLAY_TOGGLE, { id: options.id, open: true });
      }

      closeButton.addEventListener('click', close);
      dom.qs('.overlay__scrim', root).addEventListener('click', close);

      root.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { event.stopPropagation(); close(); return; }
        if (event.key !== 'Tab') return;

        var items = focusable(panel);
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });

      var api = {
        element: root,
        body: body,
        open: open,
        close: close,
        toggle: function () { if (openOverlay === api) close(); else open(); },
        get isOpen() { return openOverlay === api; }
      };

      return api;
    },

    closeAll: function () { if (openOverlay) openOverlay.close(); }
  };
})(window.AIC);

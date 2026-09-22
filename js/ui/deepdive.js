/**
 * ESSENTIAL / ENGINEERING DEEP DIVE.
 *
 * The two-layer contract every concept in the course has to honour: a plain
 * explanation that stands on its own, and an optional technical layer for the
 * engineers who want the mechanism.
 *
 * Built once, reused by every beat — and by any future chapter, because it
 * takes data, not markup:
 *
 *   AIC.ui.deepDive.create({
 *     deepDive: { title, intro, flow: [...], notes: [...] },
 *     copilot:  { title, body, example },     // optional
 *     lab:      'tokenizer-lab'               // optional
 *   });
 *
 * It returns the toggle and the panel *separately*, because they do not live
 * in the same place: on a wide screen the panel unfolds into a second column
 * beside the story instead of pushing the copy past the bottom of the pinned
 * stage. The caller decides where each one goes.
 *
 * Accessibility: a real <button> with aria-expanded and aria-controls, panel
 * hidden with the `hidden` attribute so it leaves the tab order when closed.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;

  var counter = 0;

  function labSlot(labId) {
    var slot = dom.el('div', { class: 'lab', 'data-lab': labId });

    if (AIC.core.registry.has(labId)) {
      // Labs mount lazily: nothing heavy runs until the panel is opened.
      slot.dataset.pending = 'true';
      return slot;
    }

    slot.appendChild(dom.el('p', {
      class: 'lab__placeholder',
      children: [
        dom.el('span', { class: 'lab__tag', text: 'MÓDULO INTERATIVO' }),
        dom.el('span', { class: 'lab__name', text: labId }),
        dom.el('span', { class: 'lab__hint', text: 'Reservado nesta etapa — o componente será montado aqui.' })
      ]
    }));
    return slot;
  }

  AIC.ui.deepDive = {
    create: function (beat) {
      var deep = beat.deepDive;
      var copilot = beat.copilot && beat.copilot.surface !== 'inline' ? beat.copilot : null;
      if (!deep && !copilot && !beat.lab) return null;

      counter += 1;
      var panelId = 'deepdive-' + counter;

      var toggle = dom.el('button', {
        type: 'button',
        class: 'deepdive__toggle',
        'aria-expanded': 'false',
        'aria-controls': panelId,
        children: [
          AIC.ui.markers.create('engineering', { label: 'ENGINEERING DEEP DIVE' }),
          dom.icon('chevron-right', { class: 'deepdive__chevron' })
        ]
      });

      var panelContent = [];

      if (deep) {
        if (deep.title) panelContent.push(dom.el('h3', { class: 'deepdive__title', text: deep.title }));
        if (deep.intro) panelContent.push(dom.el('p', { class: 'prose prose--dim', html: AIC.ui.text.inline(deep.intro) }));
        if (deep.flow && deep.flow.length) {
          panelContent.push(AIC.ui.flow.create(deep.flow, { label: 'Fluxo técnico: ' + (deep.title || beat.title) }));
        }
        if (deep.notes && deep.notes.length) {
          var notes = dom.el('ul', { class: 'notes' });
          deep.notes.forEach(function (note) {
            notes.appendChild(dom.el('li', { class: 'notes__item', html: AIC.ui.text.inline(note) }));
          });
          panelContent.push(notes);
        }
      }

      if (beat.lab) panelContent.push(labSlot(beat.lab));

      if (copilot) {
        panelContent.push(dom.el('aside', {
          class: 'copilot-note',
          children: [
            AIC.ui.markers.create('copilot'),
            copilot.title ? dom.el('h4', { class: 'copilot-note__title', text: copilot.title }) : null,
            dom.el('p', { class: 'prose prose--dim', html: AIC.ui.text.inline(copilot.body) }),
            copilot.example ? dom.el('p', { class: 'copilot-note__example', text: copilot.example }) : null
          ]
        }));
      }

      var panel = dom.el('div', {
        id: panelId,
        class: 'deepdive__panel',
        hidden: 'hidden',
        children: [dom.el('div', { class: 'deepdive__inner', children: panelContent })]
      });

      var open = false;
      var host = null;

      function afterOpen() {
        var inner = dom.qs('.deepdive__inner', panel);
        // Flag the fade only when the panel genuinely has more to show.
        panel.classList.toggle('is-scrollable', inner.scrollHeight - inner.clientHeight > 4);

        // Single column: the panel opens below the fold, so bring it up. On a
        // wide screen it is already beside the copy and this is a no-op.
        if (AIC.core.capabilities.compact) {
          panel.scrollIntoView({
            block: 'nearest',
            behavior: AIC.core.motion.reduced ? 'auto' : 'smooth'
          });
        }
      }

      function setOpen(next) {
        if (open === next) return;
        open = next;
        toggle.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('is-open', open);
        if (host) host.classList.toggle('is-deepdive-open', open);

        if (open) {
          panel.hidden = false;
          var slot = dom.qs('.lab[data-pending]', panel);
          if (slot) {
            delete slot.dataset.pending;
            slot.innerHTML = '';
            AIC.core.registry.mount(slot.dataset.lab, slot, { beat: beat });
          }
          AIC.ui.animate.expand(panel);
          window.setTimeout(afterOpen, AIC.core.motion.reduced ? 0 : 460);
        } else {
          panel.classList.remove('is-scrollable');
          AIC.ui.animate.collapse(panel, function () { panel.hidden = true; });
        }

        bus.emit(events.DEEPDIVE_TOGGLE, { beatId: beat.id, open: open });
      }

      toggle.addEventListener('click', function () { setOpen(!open); });

      return {
        toggle: toggle,
        panel: panel,
        /** The element that carries the `is-deepdive-open` state class. */
        setHost: function (element) { host = element; },
        open: function () { setOpen(true); },
        close: function () { setOpen(false); },
        get isOpen() { return open; }
      };
    }
  };
})(window.AIC);

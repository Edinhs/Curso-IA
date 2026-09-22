/**
 * The mind map, appearing where it is earned.
 *
 * The full map lives in an overlay, but a map you have to go and open is not
 * a model you feel yourself building. So when a station unlocks a concept, the
 * branch that just grew surfaces briefly in the corner —
 *
 *     AI
 *     └─ Machine Learning
 *        └─ Deep Learning        ← new
 *
 * — holds for a few seconds, and contracts toward the map control in the top
 * bar, where the counter ticks up. The reader sees the structure grow, sees
 * where it went, and is not left with a panel to manage.
 *
 * Only the path from the root to the new concept is drawn. The whole map would
 * be noise at this size, and the point is the branch, not the tree.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var motion = AIC.core.config.motion;

  var HOLD_MS = 3600;

  /** Root → node, so the branch reads as a lineage rather than a label. */
  function lineage(nodeId) {
    var byId = Object.create(null);
    AIC.data.mindmap.nodes.forEach(function (node) { byId[node.id] = node; });

    var chain = [];
    var current = byId[nodeId];
    var guard = 0;
    while (current && guard < 24) {
      chain.unshift(current);
      current = current.parent ? byId[current.parent] : null;
      guard += 1;
    }
    return chain;
  }

  AIC.ui.mindmapFlash = {
    mount: function (root) {
      var panel = dom.el('aside', {
        class: 'flash',
        'aria-hidden': 'true',
        hidden: 'hidden'
      });
      root.appendChild(panel);

      var timer = null;
      var animation = null;

      function hide() {
        window.clearTimeout(timer);
        if (!AIC.core.capabilities.gsap || AIC.core.motion.reduced) {
          panel.classList.remove('is-open');
          panel.hidden = true;
          return;
        }
        animation = window.gsap.to(panel, {
          opacity: 0,
          y: -10,
          scale: 0.94,
          duration: motion.base,
          ease: motion.easeIn,
          onComplete: function () {
            panel.hidden = true;
            panel.classList.remove('is-open');
            window.gsap.set(panel, { clearProps: 'all' });
          }
        });
      }

      function show(nodeId) {
        var chain = lineage(nodeId);
        if (!chain.length) return;

        panel.innerHTML = '';
        panel.appendChild(dom.el('p', { class: 'flash__label', text: 'novo conceito' }));

        var list = dom.el('ol', { class: 'flash__branch' });
        chain.forEach(function (node, index) {
          var era = AIC.data.getEra(node.era);
          list.appendChild(dom.el('li', {
            class: 'flash__node' + (index === chain.length - 1 ? ' is-new' : ''),
            style: '--branch-depth:' + index + (era ? ';--node-signature:' + era.accent : ''),
            children: [
              dom.el('span', { class: 'flash__mark', 'aria-hidden': 'true' }),
              dom.el('span', { class: 'flash__name', text: node.label })
            ]
          }));
        });
        panel.appendChild(list);

        panel.hidden = false;
        panel.classList.add('is-open');

        if (animation) animation.kill();
        if (AIC.core.capabilities.gsap && !AIC.core.motion.reduced) {
          window.gsap.fromTo(panel,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: motion.long, ease: motion.ease });
          window.gsap.fromTo(dom.qsa('.flash__node', panel),
            { opacity: 0, x: -10 },
            {
              opacity: 1,
              x: 0,
              duration: motion.base,
              ease: motion.ease,
              stagger: motion.stagger,
              delay: motion.short
            });
        }

        window.clearTimeout(timer);
        timer = window.setTimeout(hide, HOLD_MS);
      }

      bus.on(events.MINDMAP_GROW, function (payload) {
        // One branch at a time. Unlocking three concepts at once — which a jump
        // can do — shows the furthest one, not a stack of panels.
        show(payload.added[payload.added.length - 1]);
      });

      // An overlay taking the screen makes this redundant, and the technical
      // layer claims exactly the space it surfaces in.
      function dismissIfOpen(payload) {
        if (payload.open && panel.classList.contains('is-open')) hide();
      }
      bus.on(events.OVERLAY_TOGGLE, dismissIfOpen);
      bus.on(events.DEEPDIVE_TOGGLE, dismissIfOpen);

      return { show: show, hide: hide };
    }
  };
})(window.AIC);

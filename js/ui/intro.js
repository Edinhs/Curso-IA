/**
 * The cold open.
 *
 *   AI  →  "How did we get here?"  →  1950  →  "Can machines think?"
 *
 * Four beats of typography on an almost empty screen. It plays on load rather
 * than on scroll, because the first thing the experience has to establish is
 * that this is a narrative, not a page.
 *
 * Two rules keep it from being annoying:
 *   · any attempt to scroll fast-forwards the sequence to its end instead of
 *     fighting the user
 *   · under reduced motion the whole thing is simply present, immediately
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var utils = AIC.core.utils;
  var config = AIC.core.config;

  AIC.ui.intro = {
    build: function () {
      var lines = [
        dom.el('h1', {
          class: 'intro__mark',
          children: [
            dom.el('span', { class: 'intro__ai', text: 'AI' }),
            dom.el('span', { class: 'intro__expanded', text: 'Artificial Intelligence' })
          ]
        }),
        dom.el('p', { class: 'intro__line intro__line--lg', text: 'How did we get here?' }),
        dom.el('p', { class: 'intro__year', text: '1950' }),
        dom.el('p', { class: 'intro__line intro__line--quote', text: '“Can machines think?”' })
      ];

      var cue = dom.el('div', {
        class: 'intro__cue',
        children: [
          dom.el('span', { class: 'intro__cue-label', text: 'role para avançar no tempo' }),
          dom.icon('scroll-cue', { class: 'intro__cue-icon' })
        ]
      });

      return dom.el('section', {
        class: 'intro',
        id: 'intro',
        'data-station': '',
        'data-depth': '0',
        'data-anchor': '0',
        'data-era': 'origins',
        style: '--intro-height:' + config.scroll.introHeightVh + 'vh',
        children: [
          dom.el('div', {
            class: 'intro__stage',
            children: [
              dom.el('div', { class: 'intro__inner', children: lines }),
              cue
            ]
          })
        ]
      });
    },

    /** Plays the sequence and wires the scroll-to-skip behaviour. */
    play: function (section) {
      var inner = dom.qs('.intro__inner', section);
      var cue = dom.qs('.intro__cue', section);
      var steps = dom.qsa('.intro__mark, .intro__line, .intro__year', inner);
      var all = steps.concat([cue]);

      if (AIC.core.motion.reduced || !AIC.core.capabilities.gsap) {
        all.forEach(function (element) { element.classList.add('is-revealed'); });
        section.classList.add('is-played');
        return;
      }

      var timeline = window.gsap.timeline({
        defaults: { duration: 1.15, ease: 'power2.out' },
        onComplete: function () { section.classList.add('is-played'); }
      });

      timeline
        // The letters settle inwards as they resolve. Tweening the variable
        // keeps the optical centring in step with the tracking.
        .to(steps[0], { opacity: 1, filter: 'blur(0px)', '--mark-track': '0.04em' }, 0.45)
        .to(steps[1], { opacity: 1, y: 0, filter: 'blur(0px)' }, 1.9)
        .to(steps[2], { opacity: 1, y: 0, filter: 'blur(0px)' }, 3.3)
        .to(steps[3], { opacity: 1, y: 0, filter: 'blur(0px)' }, 4.5)
        .to(cue, { opacity: 1, y: 0, duration: 0.8 }, 5.7);

      // The user is in charge. Any intent to move ends the performance.
      function skip() {
        timeline.progress(1);
        detach();
      }

      var options = { passive: true };
      function detach() {
        window.removeEventListener('wheel', skip, options);
        window.removeEventListener('touchmove', skip, options);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('scroll', onScroll, options);
      }
      function onKey(event) {
        if (['PageDown', 'ArrowDown', ' ', 'End'].indexOf(event.key) !== -1) skip();
      }
      function onScroll() {
        if ((window.scrollY || 0) > 4) skip();
      }

      window.addEventListener('wheel', skip, options);
      window.addEventListener('touchmove', skip, options);
      window.addEventListener('keydown', onKey);
      window.addEventListener('scroll', onScroll, options);
    },

    /** Fades the cold open out as the journey begins. */
    bindScrub: function (section) {
      var stage = dom.qs('.intro__stage', section);
      if (AIC.core.motion.reduced) return;

      function apply(progress) {
        var out = 1 - utils.smoothstep(0.25, 0.85, progress);
        stage.style.setProperty('--copy-opacity', out.toFixed(3));
        stage.style.setProperty('--copy-shift', (-progress * 60).toFixed(1) + 'px');
      }

      if (AIC.core.capabilities.scrollTrigger) {
        window.ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: function (self) { apply(self.progress); }
        });
      }
      apply(0);
    }
  };
})(window.AIC);

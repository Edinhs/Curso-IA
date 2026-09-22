/**
 * The cold open.
 *
 *   ·  →  |  →  AI  →  "How did we get here?"  →  1950  →  "Can machines think?"
 *
 * It begins with a point, not with type. A single mark in an empty frame, then
 * the axis it sits on, and only then language. By the time the first word
 * arrives the reader already knows they are somewhere rather than on a page.
 *
 * It plays on load rather than on scroll, because the first thing the
 * experience has to establish is that this is a narrative. Two rules keep that
 * from being annoying:
 *   · any attempt to scroll fast-forwards the sequence instead of fighting it
 *   · under reduced motion the whole composition is simply present
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var utils = AIC.core.utils;
  var config = AIC.core.config;
  var motion = config.motion;

  AIC.ui.intro = {
    build: function () {
      // The mark and the axis. Everything that follows is measured from here.
      var field = dom.el('div', {
        class: 'intro__field',
        'aria-hidden': 'true',
        children: [
          dom.el('span', { class: 'intro__axis' }),
          dom.el('span', { class: 'intro__point' })
        ]
      });

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

      // The scroll cue: a hairline with a pulse running down it. No button,
      // no chevron, no instruction longer than three words.
      var cue = dom.el('div', {
        class: 'intro__cue',
        children: [
          dom.el('span', { class: 'intro__cue-label', text: 'role para avançar' }),
          dom.el('span', {
            class: 'intro__cue-rail',
            'aria-hidden': 'true',
            children: [dom.el('span', { class: 'intro__cue-pulse' })]
          })
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
            children: [field, dom.el('div', { class: 'intro__inner', children: lines }), cue]
          })
        ]
      });
    },

    /** Plays the sequence and wires the scroll-to-skip behaviour. */
    play: function (section) {
      var inner = dom.qs('.intro__inner', section);
      var cue = dom.qs('.intro__cue', section);
      var point = dom.qs('.intro__point', section);
      var axis = dom.qs('.intro__axis', section);
      var steps = dom.qsa('.intro__mark, .intro__line, .intro__year', inner);
      var everything = [point, axis].concat(steps, [cue]);

      function finish() {
        section.classList.add('is-played');
        // The chrome only exists once the opening has said what it is.
        document.documentElement.classList.remove('is-opening');
      }

      if (AIC.core.motion.reduced || !AIC.core.capabilities.gsap) {
        everything.forEach(function (element) { element.classList.add('is-revealed'); });
        finish();
        return;
      }

      var timeline = window.gsap.timeline({
        defaults: { duration: motion.slow, ease: motion.ease },
        onComplete: finish
      });

      timeline
        // A single point in an empty frame.
        .to(point, { opacity: 1, scale: 1, duration: motion.long }, 0.5)
        // The axis it sits on — the time the journey is about to travel.
        .to(axis, { opacity: 1, scaleY: 1, duration: motion.cinematic }, 1.0)
        // Then, and only then, language.
        .to(steps[0], { opacity: 1, filter: 'blur(0px)', '--mark-track': '0.04em' }, 1.9)
        .to(steps[1], { opacity: 1, y: 0, filter: 'blur(0px)' }, 3.3)
        .to(steps[2], { opacity: 1, y: 0, filter: 'blur(0px)' }, 4.5)
        .to(steps[3], { opacity: 1, y: 0, filter: 'blur(0px)' }, 5.5)
        .to(cue, { opacity: 1, y: 0, duration: motion.long }, 6.4);

      // The reader is in charge. Any intent to move ends the performance.
      function skip() {
        timeline.progress(1);
        finish();
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

    /**
     * Departure from the cold open.
     *
     * The composition lifts and dissolves as the journey begins — the same
     * movement every station will use to leave, established here first.
     */
    bindScrub: function (section) {
      var stage = dom.qs('.intro__stage', section);
      if (AIC.core.motion.reduced) return;

      function apply(progress) {
        var out = 1 - utils.smoothstep(0.22, 0.8, progress);
        stage.style.setProperty('--copy-opacity', out.toFixed(3));
        stage.style.setProperty('--copy-shift', (-progress * 70).toFixed(1) + 'px');
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

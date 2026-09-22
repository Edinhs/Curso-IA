/**
 * The shared movements.
 *
 * GSAP when it is there, a sane fallback when it is not, and nothing at all
 * under reduced motion. Components call these instead of reaching for `gsap`
 * directly, so there is one place that knows about both — and one place that
 * reads the timings from `config.motion` rather than inventing them.
 */
(function (AIC) {
  'use strict';

  function hasGsap() {
    return AIC.core.capabilities.gsap && !AIC.core.motion.reduced;
  }

  var motion = AIC.core.config.motion;

  AIC.ui.animate = {
    /**
     * A technical layer sliding in from the edge of the frame.
     *
     * Not a height expansion and not a modal: the panel arrives laterally
     * while the narrative beside it stays visible and steps back. Its contents
     * resolve in sequence, so the reader's eye is led down the diagram rather
     * than confronted with all of it at once.
     */
    slideIn: function (element, items) {
      element.style.opacity = '';
      element.style.transform = '';
      if (!hasGsap()) return;

      var timeline = window.gsap.timeline();
      timeline.fromTo(element,
        { opacity: 0, x: 28 },
        { opacity: 1, x: 0, duration: motion.long, ease: motion.ease });

      if (items && items.length) {
        timeline.fromTo(items,
          { opacity: 0, x: 14 },
          {
            opacity: 1,
            x: 0,
            duration: motion.base,
            ease: motion.ease,
            stagger: motion.stagger
          }, motion.short);
      }
      return timeline;
    },

    slideOut: function (element, onDone) {
      if (!hasGsap()) { onDone && onDone(); return; }
      window.gsap.to(element, {
        opacity: 0,
        x: 20,
        duration: motion.short,
        ease: motion.easeIn,
        onComplete: function () {
          element.style.opacity = '';
          element.style.transform = '';
          onDone && onDone();
        }
      });
    }
  };
})(window.AIC);

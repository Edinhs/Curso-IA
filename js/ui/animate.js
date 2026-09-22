/**
 * The two or three animations that are shared across components.
 *
 * GSAP when it is there, a sane CSS-free fallback when it is not, and nothing
 * at all under reduced motion. Components call these instead of reaching for
 * `gsap` directly, so there is exactly one place that knows about both.
 */
(function (AIC) {
  'use strict';

  function hasGsap() {
    return AIC.core.capabilities.gsap && !AIC.core.motion.reduced;
  }

  AIC.ui.animate = {
    /** Height auto-expansion without the usual max-height guesswork. */
    expand: function (element) {
      element.style.height = '';
      if (!hasGsap()) { element.style.opacity = ''; return; }
      var target = element.scrollHeight;
      window.gsap.fromTo(element,
        { height: 0, opacity: 0 },
        {
          height: target,
          opacity: 1,
          duration: 0.44,
          ease: 'power2.out',
          onComplete: function () { element.style.height = 'auto'; }
        });
    },

    collapse: function (element, onDone) {
      if (!hasGsap()) { onDone && onDone(); return; }
      window.gsap.to(element, {
        height: 0,
        opacity: 0,
        duration: 0.32,
        ease: 'power2.in',
        onComplete: function () {
          element.style.height = '';
          element.style.opacity = '';
          onDone && onDone();
        }
      });
    }
  };
})(window.AIC);

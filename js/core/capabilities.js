/**
 * Feature detection, resolved once at boot.
 *
 * Everything degrades rather than breaks: no WebGL means a 2D canvas stand-in,
 * no GSAP means the page is still a readable, scrollable document.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;

  function detectWebGL() {
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl2') || canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) return false;
      // Some virtualised corporate machines expose a context that cannot draw.
      return typeof gl.getParameter === 'function' && !!gl.getParameter(gl.VERSION);
    } catch (error) {
      return false;
    }
  }

  function detectCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  var compactQuery = window.matchMedia
    ? window.matchMedia('(max-width: ' + config.performance.compactBreakpoint + 'px)')
    : { matches: false, addEventListener: function () {} };

  var capabilities = {
    webgl: detectWebGL(),
    gsap: typeof window.gsap === 'function' || typeof window.gsap === 'object',
    scrollTrigger: !!(window.ScrollTrigger),
    three: typeof window.THREE === 'object',
    coarsePointer: detectCoarsePointer(),
    compact: compactQuery.matches,
    /** True when the browser can smoothly scroll to an element for us. */
    smoothScroll: 'scrollBehavior' in document.documentElement.style
  };

  compactQuery.addEventListener && compactQuery.addEventListener('change', function (event) {
    capabilities.compact = event.matches;
  });

  AIC.core.capabilities = capabilities;

  /** Reflected onto <html> so CSS can adapt without querying JavaScript. */
  AIC.core.applyCapabilityClasses = function () {
    var root = document.documentElement;
    root.classList.toggle('has-webgl', capabilities.webgl);
    root.classList.toggle('no-webgl', !capabilities.webgl);
    root.classList.toggle('has-gsap', capabilities.gsap && capabilities.scrollTrigger);
  };
})(window.AIC);

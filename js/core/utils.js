/**
 * Pure helpers shared by the scroll engine and the 3D stage.
 */
(function (AIC) {
  'use strict';

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  AIC.core.utils = {
    clamp: clamp,

    lerp: function (from, to, amount) {
      return from + (to - from) * amount;
    },

    /** Maps `value` from one range to another, clamped to 0..1 on the way out. */
    progress: function (value, start, end) {
      if (end === start) return 0;
      return clamp((value - start) / (end - start), 0, 1);
    },

    /** Frame-rate independent easing factor for a per-frame lerp. */
    damp: function (ease, deltaSeconds) {
      return 1 - Math.pow(1 - clamp(ease, 0, 1), clamp(deltaSeconds, 0, 0.1) * 60);
    },

    smoothstep: function (edge0, edge1, x) {
      var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    },

    /**
     * Deterministic pseudo-random generator.
     * The starfield must look identical on every reload — a random layout that
     * reshuffles between sessions makes the experience feel unfinished.
     */
    seededRandom: function (seed) {
      var state = seed >>> 0 || 1;
      return function () {
        state ^= state << 13; state >>>= 0;
        state ^= state >> 17;
        state ^= state << 5; state >>>= 0;
        return state / 4294967296;
      };
    },

    debounce: function (fn, wait) {
      var timer = null;
      return function () {
        var args = arguments;
        var self = this;
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { fn.apply(self, args); }, wait);
      };
    },

    /** Wraps a callback so it runs at most once per animation frame. */
    rafThrottle: function (fn) {
      var queued = false;
      var lastArgs = null;
      return function () {
        lastArgs = arguments;
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(function () {
          queued = false;
          fn.apply(null, lastArgs);
        });
      };
    }
  };
})(window.AIC);

/**
 * The shape of the journey through space.
 *
 * The camera travels along -Z. A perfectly straight tube reads as a screensaver,
 * so the path drifts gently sideways and vertically. The corridor geometry and
 * the beat markers sample the *same* function, which is why the rails always
 * look like a road the camera is actually following.
 *
 * Amplitude is deliberately small and the frequency low: this is a slow bank,
 * not a rollercoaster. Anything faster makes people motion-sick.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;

  /** @param t journey progress, 0..1 */
  function offsetAt(t, target) {
    var amplitude = config.stage.driftAmplitude;
    target.x = Math.sin(t * Math.PI * 2.4) * amplitude;
    target.y = Math.sin(t * Math.PI * 1.6 + 1.1) * amplitude * 0.34;
    return target;
  }

  AIC.scene.path = {
    offsetAt: offsetAt,

    /** World Z for a normalised position on the timeline. */
    zAt: function (t) {
      return -t * config.stage.corridorDepth;
    },

    /** Inverse of `zAt`, used by the corridor geometry builder. */
    tAt: function (z) {
      return -z / config.stage.corridorDepth;
    }
  };
})(window.AIC);

/**
 * Central configuration. Nothing in the codebase hard-codes a tuning number;
 * if a value shapes the experience, it lives here.
 */
(function (AIC) {
  'use strict';

  AIC.core.config = {
    /** Scroll length granted to each narrative beat, as a multiple of viewport height. */
    scroll: {
      beatHeightVh: 220,
      introHeightVh: 260,
      outroHeightVh: 180,
      /** Portion of a beat spent fading copy in / holding / fading out. */
      copyIn: 0.22,
      copyOut: 0.82,
      /** ScrollTrigger smoothing applied to the camera, in seconds. 0 disables it. */
      cameraEase: 0.35
    },

    /** The 3D corridor the camera travels through. One unit ≈ one metre. */
    stage: {
      cameraFov: 52,
      cameraNear: 0.5,
      cameraFar: 420,
      /** Total depth travelled between the first and last beat. */
      corridorDepth: 900,
      /** Camera sits this far in front of the beat it is currently narrating. */
      standoff: 26,
      fogDensity: 0.0042,
      /** Lateral drift, so the journey never feels like a straight tube. */
      driftAmplitude: 5,
      parallax: { strength: 2.2, ease: 0.06 },
      /**
       * Lateral framing. On wide screens the copy sits in a left column, so the
       * camera steps left and the corridor reads to the right of the text.
       * On narrow screens the corridor stays centred, behind the copy.
       */
      compositionShift: -6.5,
      compositionShiftCompact: 0
    },

    /** Particle budgets. Scaled down automatically on small or slow devices. */
    dust: {
      count: 2800,
      countMobile: 950,
      /** Radius of the cylinder of space the motes occupy, in world units. */
      radius: 72,
      depth: 940,
      /** Mote diameter in world units, not pixels — it shrinks with distance. */
      size: 0.52
    },


    nodes: {
      ringRadius: 5.4,
      ringSegments: 48,
      /** How close the camera must be for a node to read as "active". */
      focusRange: 130
    },

    performance: {
      /** Retina is beautiful and expensive. Corporate laptops get 1.5 at most. */
      maxPixelRatio: 1.6,
      maxPixelRatioMobile: 1.3,
      /** Below this viewport width we drop to the reduced particle budget. */
      compactBreakpoint: 900,
      /** Stop rendering entirely when the tab is hidden. */
      pauseWhenHidden: true
    },

    /** Reserved for a future, strictly opt-in audio layer. Nothing loads today. */
    audio: {
      enabled: false,
      basePath: 'assets/audio/'
    }
  };
})(window.AIC);

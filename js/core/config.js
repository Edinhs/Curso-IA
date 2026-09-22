/**
 * Central configuration. Nothing in the codebase hard-codes a tuning number;
 * if a value shapes the experience, it lives here.
 */
(function (AIC) {
  'use strict';

  AIC.core.config = {
    /**
     * The motion signature, mirrored from css/tokens.css.
     *
     * Durations are seconds here and milliseconds there; they are the same
     * numbers. No component picks its own timing — if a movement needs a
     * duration that is not on this list, the list is wrong, not the movement.
     *
     * The CSS side carries one step more (`--dur-instant`, for hover
     * feedback) because nothing in JS animates that fast.
     */
    motion: {
      short: 0.22,
      base: 0.38,
      long: 0.64,
      slow: 1.1,
      cinematic: 1.8,
      stagger: 0.09,
      /* Precise deceleration. Never bounce, elastic or back. */
      ease: 'power2.out',
      easeIn: 'power2.in'
    },

    /** Scroll length granted to each narrative beat, as a multiple of viewport height. */
    scroll: {
      beatHeightVh: 215,
      introHeightVh: 260,
      outroHeightVh: 180,
      /** ScrollTrigger smoothing applied to the camera, in seconds. 0 disables it. */
      cameraEase: 0.32
    },

    /**
     * Station choreography.
     *
     * Every station plays the same five movements, so arriving anywhere in the
     * course feels like arriving. The numbers are the station's own scroll
     * progress, 0..1, and the ranges overlap on purpose: the year is still
     * settling while the question is already surfacing.
     *
     *   APPROACH   the station is ahead; its structure is a seed
     *   ARRIVAL    the coordinate lands, full size, alone on the screen
     *   REVEAL     the year settles into its slot, the question surfaces
     *   EXPLORE    everything is still and fully legible — the reading window
     *   DEPARTURE  the concept contracts, the next question opens
     */
    choreography: {
      approach: [0.00, 0.16],
      arrival: [0.10, 0.30],
      reveal: [0.24, 0.46],
      explore: [0.42, 0.78],
      departure: [0.76, 1.00]
    },

    /** The knowledge space the camera travels through. One unit ≈ one metre. */
    stage: {
      cameraFov: 50,
      cameraNear: 0.5,
      cameraFar: 460,
      /** Total depth travelled between the first and last beat. */
      corridorDepth: 900,
      /**
       * How far the camera sits behind the concept it is narrating.
       *
       * This is the single most important number in the composition. Too
       * small and the camera flies through the construct halfway through the
       * reading window; large enough and the concept stays framed ahead for
       * the whole of EXPLORE and is only passed on the way out.
       */
      standoff: 90,
      fogDensity: 0.0039,
      /** Lateral drift, so the journey never feels like a straight tube. */
      driftAmplitude: 5,
      parallax: { strength: 2.2, ease: 0.06 },
      /** Lateral dolly when the engineering layer takes over the right half. */
      deepDiveDolly: 5.5,
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

    /**
     * Lighting and depth.
     *
     * Depth is the medium the story is told in, so the numbers that govern it
     * are declared rather than scattered: how bright a concept is when it is
     * still ahead, when it is being narrated, and once it is behind you.
     */
    lighting: {
      /** Structure brightness by state. A concept never goes fully dark. */
      seed: 0.1,
      forming: 0.38,
      active: 1,
      residue: 0.2,
      /** Neutral line colour of the space itself — graphite and white. */
      structure: 0xa9bcd2,
      /** How much of the era signature reaches the fog. Kept very low. */
      fogSignature: 0.05
    },

    /**
     * How a construct reads at distance. Beyond `seedRange` it is a trace;
     * approaching, it draws itself; at `activeRange` it is fully formed.
     *
     * `passRange` fades it out as the camera goes by — a concept sliding
     * past the lens at two metres is a wall, not an idea.
     */
    constructs: {
      seedRange: 430,
      activeRange: 95,
      passRange: [6, 34],
      /** One number to size every construct against the standoff. */
      scale: 1.7,
      /** Placed beside the path, not on it, so the camera passes alongside. */
      offsetX: 9,
      offsetY: 1.5
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

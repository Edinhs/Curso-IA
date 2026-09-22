/**
 * Station choreography.
 *
 * Every station — today's four, and the fifty or so the finished course will
 * have — plays the same five movements. Arriving at chapter 11 should feel
 * like arriving at chapter 01, because the language of arrival is the same.
 *
 *   APPROACH   the station is ahead; its structure is only a seed
 *   ARRIVAL    the coordinate lands, full size, alone on the screen
 *   REVEAL     the year settles into its slot, the question surfaces
 *   EXPLORE    everything holds still and fully legible — the reading window
 *   DEPARTURE  the concept contracts, and the next question opens
 *
 * This module owns the *timing* and nothing else. It converts a station's
 * scroll progress into five normalised phase values and publishes them; the
 * copy, the 3D construct and the mind map each decide for themselves what to
 * do with `reveal === 0.4`.
 *
 * Both directions work by construction: these are positions on a curve, not
 * triggered animations, so scrolling back plays the arrival in reverse rather
 * than leaving the screen in a state it cannot get out of.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;
  var bus = AIC.core.bus;
  var events = AIC.core.events;

  var PHASES = ['approach', 'arrival', 'reveal', 'explore', 'departure'];

  /** Phase value at station progress `t`: 0 before its range, 1 after. */
  function phaseValue(name, t) {
    var range = config.choreography[name];
    return utils.smoothstep(range[0], range[1], t);
  }

  /**
   * A phase that rises and falls — used by anything that should be present
   * *during* a movement and gone after it, like the hero coordinate.
   */
  function phaseWindow(name, next, t) {
    return phaseValue(name, t) * (1 - phaseValue(next, t));
  }

  function compute(t) {
    var state = { progress: t };
    for (var i = 0; i < PHASES.length; i += 1) {
      state[PHASES[i]] = phaseValue(PHASES[i], t);
    }

    // The coordinate is alone on screen between ARRIVAL and REVEAL, then
    // settles. `settle` is 0 while it is the hero and 1 once it is a label.
    state.settle = state.reveal;
    state.heroYear = phaseWindow('arrival', 'reveal', t);

    // Copy presence: up through REVEAL, held through EXPLORE, out at DEPARTURE.
    state.copy = state.reveal * (1 - state.departure * 0.92);

    // Which movement is currently dominant, for CSS hooks and the debug HUD.
    state.name = 'approach';
    for (var j = PHASES.length - 1; j >= 0; j -= 1) {
      if (state[PHASES[j]] > 0.5) { state.name = PHASES[j]; break; }
    }
    return state;
  }

  AIC.scroll.choreography = {
    phases: PHASES,
    compute: compute,

    /**
     * Binds a station element so its phase values land on the element as CSS
     * custom properties and on the bus for the 3D scene.
     *
     * ScrollTrigger scrubs it when available. Without GSAP the station still
     * resolves — it snaps to its EXPLORE state when it enters the viewport,
     * so the content is complete and readable, just not choreographed.
     */
    bind: function (element, stationId) {
      var last = -1;

      function apply(t) {
        if (Math.abs(t - last) < 0.0008) return;
        last = t;

        var state = compute(t);
        for (var i = 0; i < PHASES.length; i += 1) {
          element.style.setProperty('--' + PHASES[i], state[PHASES[i]].toFixed(4));
        }
        element.style.setProperty('--settle', state.settle.toFixed(4));
        element.style.setProperty('--hero-year', state.heroYear.toFixed(4));
        element.style.setProperty('--copy', state.copy.toFixed(4));
        element.dataset.phase = state.name;

        bus.emit(events.STATION_PHASE, { stationId: stationId, state: state });
      }

      if (AIC.core.motion.reduced) {
        apply(0.6); // the EXPLORE state: everything present, nothing moving
        return { apply: apply, settled: true };
      }

      if (AIC.core.capabilities.scrollTrigger) {
        apply(0);
        window.ScrollTrigger.create({
          trigger: element,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: function (self) { apply(self.progress); },
          onLeave: function () { apply(1); },
          onLeaveBack: function () { apply(0); }
        });
      } else {
        var observer = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { apply(entry.isIntersecting ? 0.6 : 0); });
        }, { rootMargin: '-25% 0px -25% 0px' });
        observer.observe(element);
      }

      return { apply: apply, settled: false };
    }
  };
})(window.AIC);

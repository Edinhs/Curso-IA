/**
 * Motion policy.
 *
 * `prefers-reduced-motion` is honoured for real: the journey still tells the
 * same story, it simply stops moving. The user can also override the system
 * setting from the toolbar, because a lecture hall projector and a personal
 * laptop are not the same situation.
 */
(function (AIC) {
  'use strict';

  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var STORAGE_KEY = 'aic.motion';

  var query = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false, addEventListener: function () {} };

  var override = null;
  try {
    var stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'full' || stored === 'reduced') override = stored;
  } catch (error) {
    // Private mode or a locked-down corporate profile. Fall back to the system setting.
  }

  function reduced() {
    return override ? override === 'reduced' : query.matches;
  }

  function publish() {
    document.documentElement.classList.toggle('reduced-motion', reduced());
    bus.emit(events.MOTION_CHANGE, { reduced: reduced() });
  }

  query.addEventListener && query.addEventListener('change', function () {
    if (!override) publish();
  });

  AIC.core.motion = {
    get reduced() { return reduced(); },

    /** `null` restores the operating system preference. */
    setOverride: function (value) {
      override = value;
      try {
        if (value) window.localStorage.setItem(STORAGE_KEY, value);
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) { /* storage unavailable — the override lives for this session only */ }
      publish();
    },

    toggle: function () {
      AIC.core.motion.setOverride(reduced() ? 'full' : 'reduced');
      return reduced();
    },

    init: publish
  };
})(window.AIC);

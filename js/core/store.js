/**
 * Journey state.
 *
 * Deliberately tiny and observable: which beat is on screen, which era we are
 * in, and which mind-map nodes the learner has unlocked. Components read from
 * here instead of from each other.
 */
(function (AIC) {
  'use strict';

  var bus = AIC.core.bus;
  var events = AIC.core.events;

  var state = {
    progress: 0,
    beatId: null,
    eraId: null,
    visited: [],
    revealed: []
  };

  function reveal(nodeIds) {
    if (!nodeIds || !nodeIds.length) return;

    // Beats share concepts on purpose — two beats may both lean on `ai`. Dedupe
    // against what is already revealed *and* within this batch, or the counter
    // drifts above the number of nodes that actually exist.
    var added = [];
    nodeIds.forEach(function (id) {
      if (state.revealed.indexOf(id) !== -1 || added.indexOf(id) !== -1) return;
      added.push(id);
    });

    if (!added.length) return;
    state.revealed = state.revealed.concat(added);
    bus.emit(events.MINDMAP_GROW, { added: added, revealed: state.revealed.slice() });
  }

  AIC.core.store = {
    get state() { return state; },

    setProgress: function (value) {
      state.progress = value;
    },

    /** Stations without a beat (the cold open, the closing index) still set an era. */
    enterEra: function (eraId) {
      if (!eraId || state.eraId === eraId) return;
      state.eraId = eraId;
      bus.emit(events.ERA_CHANGE, { eraId: eraId });
    },

    /**
     * Everything up to `progress` counts as travelled.
     *
     * Landing on a station is not the only way past it: the chapter index, the
     * keyboard and a restored scroll position all jump. Deriving what has been
     * passed from the position itself — rather than from which stations
     * happened to fire — keeps the mind map honest however the reader got here.
     *
     * Deliberately one-way: scrolling back does not un-teach a concept.
     */
    advanceTo: function (progress) {
      var unlocked = [];
      AIC.data.beats.forEach(function (beat) {
        if (beat.depth > progress + 0.001) return;
        if (state.visited.indexOf(beat.id) !== -1) return;
        state.visited.push(beat.id);
        unlocked = unlocked.concat(beat.mindmap || []);
      });
      reveal(unlocked);
    },

    enterBeat: function (beat) {
      if (!beat || state.beatId === beat.id) return;
      state.beatId = beat.id;
      if (state.visited.indexOf(beat.id) === -1) state.visited.push(beat.id);

      AIC.core.store.enterEra(beat.era);
      reveal(beat.mindmap);
      bus.emit(events.BEAT_ENTER, beat);
    }
  };
})(window.AIC);

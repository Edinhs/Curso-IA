/**
 * Minimal publish/subscribe bus.
 *
 * Keeps the scroll engine, the 3D stage and the DOM components decoupled:
 * the scroll engine only announces where the journey is, and whoever cares
 * listens. Adding a new interactive module later means subscribing here,
 * not editing the scroll engine.
 */
(function (AIC) {
  'use strict';

  var channels = Object.create(null);

  AIC.core.bus = {
    on: function (name, handler) {
      (channels[name] || (channels[name] = [])).push(handler);
      return function off() {
        channels[name] = channels[name].filter(function (fn) { return fn !== handler; });
      };
    },

    emit: function (name, payload) {
      var listeners = channels[name];
      if (!listeners) return;
      for (var i = 0; i < listeners.length; i += 1) {
        try {
          listeners[i](payload);
        } catch (error) {
          // One broken listener must never stall the scroll loop.
          console.error('[bus] listener failed for "' + name + '"', error);
        }
      }
    }
  };

  /** Event names, in one place, so typos surface as missing constants. */
  AIC.core.events = {
    READY: 'app:ready',
    JOURNEY_PROGRESS: 'journey:progress',
    BEAT_ENTER: 'beat:enter',
    STATION_CHANGE: 'station:change',
    STATION_PHASE: 'station:phase',
    ERA_CHANGE: 'era:change',
    MINDMAP_GROW: 'mindmap:grow',
    DEEPDIVE_TOGGLE: 'deepdive:toggle',
    OVERLAY_TOGGLE: 'overlay:toggle',
    MOTION_CHANGE: 'motion:change'
  };
})(window.AIC);

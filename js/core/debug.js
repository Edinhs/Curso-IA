/**
 * Development overlay, behind `?debug=true`.
 *
 * Nothing about it ships to a reader: without the flag the module registers no
 * listeners, starts no loop and creates no DOM. It exists because the three
 * things that are hardest to reason about here — where the camera is, which
 * phase a station is in, and what the frame budget looks like — are all
 * invisible by design.
 *
 *   file:///…/index.html?debug=true
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;

  function enabled() {
    try {
      return /(^|[?&])debug=true(&|$)/.test(window.location.search);
    } catch (error) {
      return false;
    }
  }

  AIC.core.debug = {
    get enabled() { return enabled(); },

    mount: function (root, context) {
      if (!enabled()) return null;

      var rows = {};
      var panel = dom.el('aside', { class: 'debug', 'aria-hidden': 'true' });

      function row(key, label) {
        var value = dom.el('span', { class: 'debug__value', text: '—' });
        panel.appendChild(dom.el('p', {
          class: 'debug__row',
          children: [dom.el('span', { class: 'debug__key', text: label }), value]
        }));
        rows[key] = value;
      }

      row('fps', 'fps');
      row('progress', 'journey');
      row('station', 'station');
      row('phase', 'phase');
      row('local', 'local');
      row('camera', 'camera z');
      row('era', 'era');
      row('draws', 'draw calls');
      row('reduced', 'motion');

      root.appendChild(panel);

      // Seeded from the store: the overlay mounts after the first era and
      // station events have already gone out, and a readout that says "—"
      // when the state is known is a readout you stop trusting.
      var state = AIC.core.store.state;
      rows.progress.textContent = state.progress.toFixed(4);
      rows.era.textContent = state.eraId || '—';
      rows.station.textContent = state.beatId ? 'beat-' + state.beatId : '—';

      bus.on(events.JOURNEY_PROGRESS, function (payload) {
        rows.progress.textContent = payload.progress.toFixed(4);
      });

      bus.on(events.STATION_CHANGE, function (payload) {
        rows.station.textContent = payload.stationId || '—';
      });

      bus.on(events.STATION_PHASE, function (payload) {
        rows.phase.textContent = payload.state.name;
        rows.local.textContent = payload.state.progress.toFixed(3);
      });

      bus.on(events.ERA_CHANGE, function (payload) {
        rows.era.textContent = payload.eraId;
      });

      var frames = 0;
      var since = window.performance.now();

      function sample(now) {
        window.requestAnimationFrame(sample);
        frames += 1;
        if (now - since < 500) return;

        rows.fps.textContent = Math.round((frames * 1000) / (now - since));
        frames = 0;
        since = now;

        rows.reduced.textContent = AIC.core.motion.reduced ? 'reduced' : 'full';

        var backdrop = context && context.backdrop;
        if (backdrop && backdrop.telemetry) {
          rows.camera.textContent = backdrop.telemetry.cameraZ.toFixed(1);
        }
        if (backdrop && backdrop.context) {
          rows.draws.textContent = backdrop.context.renderer.info.render.calls;
        }
      }
      window.requestAnimationFrame(sample);

      document.documentElement.classList.add('is-debugging');
      return panel;
    }
  };
})(window.AIC);

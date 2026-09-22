/**
 * Scroll → time.
 *
 * The document is a stack of full-height stations. Each station declares where
 * it sits on the timeline (`data-depth`, 0..1) and where inside its own scroll
 * range it counts as "arrived" (`data-anchor`). The journey maps raw scroll
 * position onto the timeline by interpolating between consecutive anchors.
 *
 * Two consequences worth knowing:
 *   · beats do not have to be evenly spaced in time. 1950 → 1956 is six years;
 *     1956 → Machine Learning is forty. The camera covers the gap, the reader
 *     covers one screen either way.
 *   · the interpolation is eased, not linear, so the camera slows to a near
 *     stop while a beat is centred and accelerates through the gap between
 *     beats. That is what makes scrolling feel like travelling rather than
 *     like dragging a slider.
 *
 * ScrollTrigger drives the update when it is available — it already batches
 * scroll reads and recalculates on resize. Without it, a passive scroll
 * listener does the same job, so the journey never depends on GSAP loading.
 */
(function (AIC) {
  'use strict';

  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var utils = AIC.core.utils;
  var store = AIC.core.store;

  AIC.scroll.createJourney = function (container) {
    var stations = [];
    var lastProgress = -1;
    var activeStation = null;

    function readStations() {
      stations = AIC.core.dom.qsa('[data-station]', container).map(function (element) {
        return {
          element: element,
          depth: parseFloat(element.dataset.depth || '0'),
          anchorRatio: parseFloat(element.dataset.anchor || '0.5'),
          beatId: element.dataset.beat || null,
          eraId: element.dataset.era || null,
          top: 0,
          anchor: 0
        };
      });
      measure();
    }

    /**
     * Absolute scroll positions for every station.
     *
     * This is the only place the journey touches layout. Measuring on scroll
     * would force a reflow on every frame, which is exactly the cost this
     * design is meant to avoid.
     */
    function measure() {
      var viewport = window.innerHeight;
      var scrollY = window.scrollY || window.pageYOffset || 0;

      stations.forEach(function (station) {
        station.top = station.element.getBoundingClientRect().top + scrollY;
        var pinRange = Math.max(station.element.offsetHeight - viewport, 0);
        station.anchor = station.top + pinRange * station.anchorRatio;
      });
      stations.sort(function (a, b) { return a.anchor - b.anchor; });
    }

    function progressFor(scrollY) {
      if (!stations.length) return 0;
      if (scrollY <= stations[0].anchor) return stations[0].depth;

      var last = stations[stations.length - 1];
      if (scrollY >= last.anchor) return last.depth;

      for (var i = 0; i < stations.length - 1; i += 1) {
        var from = stations[i];
        var to = stations[i + 1];
        if (scrollY > to.anchor) continue;

        var local = utils.progress(scrollY, from.anchor, to.anchor);
        // Ease so the camera rests on a beat and hurries between beats.
        return utils.lerp(from.depth, to.depth, utils.smoothstep(0, 1, local));
      }
      return last.depth;
    }

    /** Which station currently owns the screen — used for BEAT_ENTER. */
    function stationFor(scrollY) {
      var viewportCentre = scrollY + window.innerHeight * 0.5;
      var current = stations[0] || null;
      for (var i = 0; i < stations.length; i += 1) {
        if (viewportCentre >= stations[i].top) current = stations[i];
      }
      return current;
    }

    function update() {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var progress = progressFor(scrollY);

      if (Math.abs(progress - lastProgress) > 0.00005) {
        lastProgress = progress;
        store.setProgress(progress);
        store.advanceTo(progress);
        bus.emit(events.JOURNEY_PROGRESS, {
          progress: progress,
          scrollY: scrollY,
          documentProgress: utils.clamp(
            scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1), 0, 1
          )
        });
      }

      var station = stationFor(scrollY);
      if (station && station !== activeStation) {
        activeStation = station;
        var beat = station.beatId ? AIC.data.getBeat(station.beatId) : null;
        if (beat) store.enterBeat(beat);
        else store.enterEra(station.eraId);
        bus.emit(events.STATION_CHANGE, { stationId: station.element.id, beat: beat });
      }
    }

    /** Scrolls the page so that `station` lands on its anchor. */
    function goToStation(station) {
      if (!station) return;
      window.scrollTo({
        top: station.anchor,
        behavior: AIC.core.motion.reduced || !AIC.core.capabilities.smoothScroll ? 'auto' : 'smooth'
      });
    }

    function step(direction) {
      var scrollY = window.scrollY || 0;
      var target = null;
      if (direction > 0) {
        for (var i = 0; i < stations.length; i += 1) {
          if (stations[i].anchor > scrollY + 8) { target = stations[i]; break; }
        }
      } else {
        for (var j = stations.length - 1; j >= 0; j -= 1) {
          if (stations[j].anchor < scrollY - 8) { target = stations[j]; break; }
        }
      }
      goToStation(target);
    }

    readStations();

    // Both sources funnel through one throttle, so the work happens at most
    // once per frame however many times the browser reports the scroll.
    var scheduleUpdate = utils.rafThrottle(update);

    if (AIC.core.capabilities.scrollTrigger) {
      window.ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: scheduleUpdate,
        onRefresh: function () { measure(); update(); }
      });
    }

    // Kept in both cases: the rubber-band region past either end of the
    // document is outside any ScrollTrigger's range.
    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    window.addEventListener('resize', utils.debounce(function () {
      measure();
      update();
    }, 150), { passive: true });

    update();

    return {
      update: update,
      measure: measure,
      next: function () { step(1); },
      previous: function () { step(-1); },
      goTo: function (stationId) {
        goToStation(stations.filter(function (s) {
          return s.element.id === stationId || s.beatId === stationId;
        })[0]);
      },
      get stations() { return stations; }
    };
  };
})(window.AIC);

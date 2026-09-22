/**
 * Bootstrap.
 *
 * The order below is the architecture in miniature:
 *   1. work out what the machine can do
 *   2. generate the document from `/data`
 *   3. light the backdrop (WebGL, or the 2D stand-in)
 *   4. connect scroll to time
 *   5. mount the chrome
 *   6. play the cold open
 *
 * Nothing between steps 2 and 6 knows how many beats or chapters exist.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;

  function createBackdrop() {
    var canvas = dom.qs('#stage-canvas');
    if (!canvas) return null;

    if (AIC.core.capabilities.webgl && AIC.core.capabilities.three) {
      try {
        return AIC.scene.createStage(canvas);
      } catch (error) {
        console.warn('[app] WebGL stage failed to start, using the 2D backdrop', error);
        document.documentElement.classList.add('no-webgl');
      }
    }
    return AIC.scene.createFallback(canvas);
  }

  function boot() {
    AIC.core.applyCapabilityClasses();
    AIC.core.motion.init();

    var journeyRoot = dom.qs('#journey');
    var chromeRoot = dom.qs('#chrome');

    var intro = AIC.ui.intro.build();
    journeyRoot.appendChild(intro);

    var beatSections = AIC.ui.beats.render(journeyRoot);
    journeyRoot.appendChild(AIC.ui.chapters.buildOutro());

    var backdrop = createBackdrop();
    if (backdrop) backdrop.start();

    // ScrollTrigger measures the document; it has to see the generated sections.
    if (AIC.core.capabilities.scrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

    var journey = AIC.scroll.createJourney(journeyRoot);

    AIC.ui.progress.mount(chromeRoot, journey);
    AIC.ui.nav.mount(chromeRoot, journey);
    AIC.ui.mindmapFlash.mount(chromeRoot);

    AIC.ui.intro.bindScrub(intro);
    AIC.ui.beats.bind(beatSections);

    // Measurements taken before webfonts land are wrong by a line or two.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        journey.measure();
        if (AIC.core.capabilities.scrollTrigger) window.ScrollTrigger.refresh();
      });
    }

    window.addEventListener('load', function () {
      journey.measure();
      if (AIC.core.capabilities.scrollTrigger) window.ScrollTrigger.refresh();
    });

    // A reload part-way through the journey restores the scroll position, and a
    // cold open playing to an empty screen behind the reader is just confusing.
    if ((window.scrollY || 0) < 8) {
      document.documentElement.classList.add('is-opening');
      AIC.ui.intro.play(intro);
    } else {
      intro.classList.add('is-played');
      dom.qsa('.intro__point, .intro__axis, .intro__mark, .intro__line, .intro__year, .intro__cue', intro)
        .forEach(function (element) { element.classList.add('is-revealed'); });
    }

    document.documentElement.classList.remove('is-booting');
    journey.update();

    AIC.core.debug.mount(chromeRoot, { journey: journey, backdrop: backdrop });
    bus.emit(events.READY, { journey: journey, backdrop: backdrop });

    AIC.journey = journey;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})(window.AIC);

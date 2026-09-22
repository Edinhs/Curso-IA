/**
 * 1950 — Turing.
 *
 * The emptiest thing in the whole journey, and it has to be: everything that
 * follows only reads as accumulation because this is nearly nothing.
 *
 * One point. One axis through it. A short baseline carrying a handful of
 * discrete marks — a signal that is either there or not, which is the whole
 * of the machinery Turing had. No terminals, no punch cards, no period
 * costume: the abstraction, not the props.
 */
(function (AIC) {
  'use strict';

  AIC.scene.constructs.define('turing-gate', function (shape) {
    var RADIUS = 9;

    // The question itself: a single point, before anything else exists.
    shape.point(0, 0, { order: 0, kind: 1, size: 4.6 });

    // The axis it sits on — continuous, because this is where evolution starts.
    shape.segment(0, -RADIUS * 0.72, 0, RADIUS * 0.72, { order: 0.12 });

    // A baseline, and on it the only vocabulary a 1950 machine had.
    shape.segment(-RADIUS, 0, RADIUS, 0, { order: 0.3 });

    var MARKS = 13;
    for (var i = 0; i < MARKS; i += 1) {
      var x = -RADIUS + (i / (MARKS - 1)) * RADIUS * 2;
      if (Math.abs(x) < 0.4) continue;
      // Alternating heights: present, absent, present. One bit at a time.
      var on = i % 3 !== 1;
      var height = on ? 1.5 : 0.55;
      shape.segment(x, -height, x, height, {
        order: 0.45 + (i / MARKS) * 0.5,
        kind: on ? 0 : 0
      });
    }

    // An arc, drawn last and deliberately left open — the question is not
    // answered here, and a closed circle would say that it was.
    var SEGMENTS = 40;
    for (var a = 0; a < SEGMENTS - 7; a += 1) {
      var a0 = (a / SEGMENTS) * Math.PI * 2 + 0.6;
      var a1 = ((a + 1) / SEGMENTS) * Math.PI * 2 + 0.6;
      var r = RADIUS * 1.24;
      shape.segment(
        Math.cos(a0) * r, Math.sin(a0) * r,
        Math.cos(a1) * r, Math.sin(a1) * r,
        { order: 0.6 + (a / SEGMENTS) * 0.38 }
      );
    }

    return { shape: shape, radius: RADIUS * 1.3 };
  });
})(window.AIC);

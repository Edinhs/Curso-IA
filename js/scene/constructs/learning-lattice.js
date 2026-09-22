/**
 * Machine Learning — rules dissolve, structure is learned.
 *
 * The single most important transition in the first half of the course, and
 * it is told entirely in geometry:
 *
 *   a rigid orthogonal grid draws itself first — hand-written rules, regular,
 *   exhaustive, brittle — and then *leaves*. Every one of its vertices carries
 *   an `aFade`, so the grid does not fade out as a whole: it comes apart cell
 *   by cell, in the same order it was built.
 *
 *   as it goes, a second structure arrives in its place. Irregular, weighted,
 *   derived from scattered observations rather than declared. Nobody drew it.
 *
 * Scroll back and the rules reassemble. That reversibility is the point — the
 * reader can watch the substitution happen in either direction.
 */
(function (AIC) {
  'use strict';

  AIC.scene.constructs.define('learning-lattice', function (shape) {
    var RADIUS = 10;
    var CELLS = 4;
    var GRID = RADIUS * 0.82;
    var step = (GRID * 2) / CELLS;

    // ── The rules: an exhaustive grid, drawn early, gone by 0.55 ────────────
    for (var i = 0; i <= CELLS; i += 1) {
      var at = -GRID + i * step;
      var order = 0.04 + (i / CELLS) * 0.2;
      var fade = 0.34 + (i / CELLS) * 0.22;
      shape.segment(at, -GRID, at, GRID, { order: order, fade: fade });
      shape.segment(-GRID, at, GRID, at, { order: order + 0.02, fade: fade + 0.03 });
    }

    // ── The observations: data points, irregular, no rule behind them ──────
    var random = AIC.core.utils.seededRandom(1959);
    var samples = [];
    for (var s = 0; s < 22; s += 1) {
      var x = (random() * 2 - 1) * RADIUS * 0.95;
      var y = (random() * 2 - 1) * RADIUS * 0.8;
      samples.push([x, y]);
      shape.point(x, y, { order: 0.3 + (s / 22) * 0.28, kind: 0, size: 2.1 });
    }

    // ── The learned structure: connections between what happened to be near
    //    each other. Weighted, not declared. ────────────────────────────────
    var THRESHOLD = RADIUS * 0.56;
    var drawn = 0;
    for (var a = 0; a < samples.length; a += 1) {
      for (var b = a + 1; b < samples.length; b += 1) {
        var dx = samples[a][0] - samples[b][0];
        var dy = samples[a][1] - samples[b][1];
        if (Math.sqrt(dx * dx + dy * dy) > THRESHOLD) continue;
        shape.segment(samples[a][0], samples[a][1], samples[b][0], samples[b][1], {
          order: 0.58 + Math.min(drawn / 40, 1) * 0.34
        });
        drawn += 1;
      }
    }

    // The model that falls out of it — one point, where nothing was placed.
    shape.point(0, 0, { order: 0.94, kind: 1, size: 4.4 });

    return { shape: shape, radius: RADIUS * 1.05 };
  });
})(window.AIC);

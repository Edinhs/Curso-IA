/**
 * 2017 — Transformer.
 *
 * The station where something visibly changes.
 *
 * A row of tokens, and between every pair a weight. What makes it attention
 * rather than a network diagram is that the weights are not fixed: one token
 * takes the query position, its relations brighten, everything else recedes —
 * and then the query moves on. The structure is constant; the emphasis is not.
 *
 * This is conceptual, not numerical. It is not computing softmax; it is
 * showing that relevance is something a model decides per position, over the
 * whole sequence at once. The arithmetic belongs in the deep dive.
 *
 * `aGroup` carries each weight's source token, so a single uniform moving
 * along the row re-weights the entire web on the GPU.
 */
(function (AIC) {
  'use strict';

  AIC.scene.constructs.define('attention-web', function (shape) {
    var RADIUS = 10.5;
    var COUNT = 7;
    var SPAN = RADIUS * 1.7;
    var tokens = [];

    for (var i = 0; i < COUNT; i += 1) {
      var t = COUNT === 1 ? 0.5 : i / (COUNT - 1);
      var x = -SPAN / 2 + t * SPAN;
      // A gentle arc, so the relations above the row have somewhere to live.
      var y = -RADIUS * 0.52 + Math.sin(t * Math.PI) * RADIUS * 0.12;
      tokens.push([x, y]);

      shape.point(x, y, { order: 0.05 + t * 0.22, kind: 1, size: 3.4 });
      // The sequence line: continuous, because order still exists.
      if (i > 0) {
        shape.segment(tokens[i - 1][0], tokens[i - 1][1], x, y, { order: 0.1 + t * 0.22 });
      }
    }

    // Every pair, once. The arc height encodes distance — attention reaching
    // further is drawn reaching further.
    var pairIndex = 0;
    var totalPairs = (COUNT * (COUNT - 1)) / 2;
    for (var a = 0; a < COUNT; a += 1) {
      for (var b = a + 1; b < COUNT; b += 1) {
        var ax = tokens[a][0];
        var ay = tokens[a][1];
        var bx = tokens[b][0];
        var by = tokens[b][1];
        var span = (b - a) / (COUNT - 1);
        var lift = RADIUS * (0.34 + span * 0.92);
        var order = 0.34 + (pairIndex / totalPairs) * 0.6;

        // A quadratic arc, sampled — the relation between two positions.
        var previous = null;
        for (var k = 0; k <= 10; k += 1) {
          var u = k / 10;
          var inv = 1 - u;
          var cx = (ax + bx) / 2;
          var cy = (ay + by) / 2 + lift;
          var px = inv * inv * ax + 2 * inv * u * cx + u * u * bx;
          var py = inv * inv * ay + 2 * inv * u * cy + u * u * by;
          if (previous) {
            shape.segment(previous[0], previous[1], px, py, {
              order: order, kind: 1, group: a
            });
          }
          previous = [px, py];
        }
        pairIndex += 1;
      }
    }

    return {
      shape: shape,
      radius: RADIUS * 1.15,

      /**
       * The query position drifts along the row. Slow enough to read as
       * deliberate attention rather than a shimmer, and only while the
       * construct is actually lit.
       */
      animate: function (construct, frame, presence) {
        var position = (Math.sin(frame.time * 0.26) * 0.5 + 0.5) * (COUNT - 1);
        construct.setFocus(position, presence);
      }
    };
  });
})(window.AIC);

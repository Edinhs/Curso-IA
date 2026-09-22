/**
 * 1956 — Dartmouth.
 *
 * One point becomes ten, and the ten find each other.
 *
 * The spokes draw first: separate people, separate disciplines, each arriving
 * from the same origin. The chords between them draw last, and only between
 * neighbours — a field cohering, not a finished network. That restraint
 * matters, because the network is what the next seventy years are for.
 */
(function (AIC) {
  'use strict';

  AIC.scene.constructs.define('dartmouth-split', function (shape) {
    var RADIUS = 9.5;
    var COUNT = 10;
    var nodes = [];

    // The origin — the same single point the previous station ended on.
    shape.point(0, 0, { order: 0, kind: 1, size: 4.2 });

    for (var i = 0; i < COUNT; i += 1) {
      var angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
      // Slight irregularity: a summer workshop, not a lattice.
      var r = RADIUS * (0.82 + ((i * 37) % 11) / 44);
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r * 0.86;
      nodes.push([x, y]);

      var order = 0.14 + (i / COUNT) * 0.38;
      shape.segment(0, 0, x, y, { order: order });
      shape.point(x, y, { order: order + 0.04, kind: 0, size: 2.6 });
    }

    // Neighbours connect. The field acquires an edge, and a name.
    for (var j = 0; j < COUNT; j += 1) {
      var a = nodes[j];
      var b = nodes[(j + 1) % COUNT];
      shape.segment(a[0], a[1], b[0], b[1], { order: 0.6 + (j / COUNT) * 0.35 });
    }

    // Two long relations across the circle: disciplines that had not met.
    shape.dashed(nodes[0][0], nodes[0][1], nodes[5][0], nodes[5][1], 9, { order: 0.86 });
    shape.dashed(nodes[2][0], nodes[2][1], nodes[7][0], nodes[7][1], 9, { order: 0.92 });

    return { shape: shape, radius: RADIUS * 1.1 };
  });
})(window.AIC);

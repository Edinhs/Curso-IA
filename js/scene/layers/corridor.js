/**
 * The time axis.
 *
 * Perspective on long parallel lines is the strongest depth cue the eye has —
 * far stronger than particles — so this is the layer that does the actual work
 * of saying "depth is time".
 *
 * It also carries the accumulation. The corridor is not uniform: it is nearly
 * bare at the origin and structurally richer further along. Two rails and a
 * sparse graduation at 1950; four rails by the learning era; cross-members and
 * an outer lattice by the time language arrives. Nobody has to notice this for
 * it to work — the reader simply feels the space filling in as they travel,
 * which is the shape of the story.
 *
 * All of it is one `LineSegments`. The density is baked into the geometry, so
 * growing the universe costs nothing at runtime.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var path = AIC.scene.path;

  var SAMPLE_STEP = 11;
  var OVERSHOOT = 160;

  /**
   * Each rail declares where on the timeline it begins. `from: 0` runs the
   * whole way; `from: 0.55` means that structure does not exist yet in 1956.
   */
  var RAILS = [
    { x: -19, y: -7.5, from: 0, tick: 2.4, tickEvery: 6 },
    { x: 19, y: -7.5, from: 0, tick: 2.4, tickEvery: 6 },
    { x: -28, y: 11.5, from: 0.3, tick: 0 },
    { x: 28, y: 11.5, from: 0.3, tick: 0 },
    { x: -40, y: -1, from: 0.72, tick: 0 },
    { x: 40, y: -1, from: 0.72, tick: 0 }
  ];

  /** Graduation gets finer further along: time is measured more precisely. */
  function tickSpacing(t) {
    return t < 0.3 ? 8 : t < 0.62 ? 5 : 3;
  }

  AIC.scene.layers.createCorridor = function (three) {
    var offset = new three.Vector3();
    var vertices = [];

    var samples = [];
    for (var z = OVERSHOOT; z >= -(config.stage.corridorDepth + OVERSHOOT); z -= SAMPLE_STEP) {
      var t = path.tAt(z);
      path.offsetAt(t, offset);
      samples.push({ z: z, t: t, x: offset.x, y: offset.y });
    }

    RAILS.forEach(function (rail) {
      for (var i = 0; i < samples.length - 1; i += 1) {
        var a = samples[i];
        var b = samples[i + 1];
        if (b.t < rail.from) continue;
        vertices.push(a.x + rail.x, a.y + rail.y, a.z);
        vertices.push(b.x + rail.x, b.y + rail.y, b.z);
      }

      if (!rail.tick) return;
      for (var j = 0; j < samples.length; j += 1) {
        var s = samples[j];
        if (s.t < rail.from) continue;
        if (j % tickSpacing(s.t) !== 0) continue;
        vertices.push(s.x + rail.x, s.y + rail.y, s.z);
        vertices.push(s.x + rail.x, s.y + rail.y + rail.tick, s.z);
      }
    });

    // Cross-members. The corridor stops being two lines and becomes a frame.
    for (var k = 0; k < samples.length; k += 1) {
      var sample = samples[k];
      if (sample.t < 0.46 || k % 14 !== 0) continue;
      vertices.push(sample.x - 19, sample.y - 7.5, sample.z);
      vertices.push(sample.x - 28, sample.y + 11.5, sample.z);
      vertices.push(sample.x + 19, sample.y - 7.5, sample.z);
      vertices.push(sample.x + 28, sample.y + 11.5, sample.z);
    }

    var geometry = new three.BufferGeometry();
    geometry.setAttribute('position', new three.Float32BufferAttribute(vertices, 3));

    // Distance fade is the scene fog's job — one uniform instead of a colour buffer.
    var material = new three.LineBasicMaterial({
      color: new three.Color(config.lighting.structure),
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      fog: true
    });

    return {
      object3d: new three.LineSegments(geometry, material),

      setTone: function (color, opacity) {
        material.color.set(color);
        material.opacity = opacity;
      },

      dispose: function () {
        geometry.dispose();
        material.dispose();
      }
    };
  };
})(window.AIC);

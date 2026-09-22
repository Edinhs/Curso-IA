/**
 * The time axis.
 *
 * Four rails sweeping into the distance plus regular graduation marks. This is
 * the layer that does the actual work of saying "depth = time": perspective on
 * long parallel lines is the strongest depth cue the eye has, far stronger than
 * particles.
 *
 * The rails sample `AIC.scene.path`, the same curve the camera follows, so the
 * corridor always bends with the journey. Distance fade is left to the scene
 * fog — one uniform instead of a per-vertex colour buffer.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var path = AIC.scene.path;

  var SAMPLE_STEP = 12;
  var OVERSHOOT = 140; // corridor extends past both ends so it never "starts"

  /** x, y offsets of each rail from the centre of the path. */
  var RAILS = [
    { x: -19, y: -7.5, tick: 2.6 },
    { x: 19, y: -7.5, tick: 2.6 },
    { x: -27, y: 11, tick: 0 },
    { x: 27, y: 11, tick: 0 }
  ];

  var TICK_EVERY = 3; // graduation marks every N samples

  AIC.scene.layers.createCorridor = function (three) {
    var offset = new three.Vector3();
    var vertices = [];

    var startZ = OVERSHOOT;
    var endZ = -(config.stage.corridorDepth + OVERSHOOT);

    var samples = [];
    for (var z = startZ; z >= endZ; z -= SAMPLE_STEP) {
      path.offsetAt(path.tAt(z), offset);
      samples.push({ z: z, x: offset.x, y: offset.y });
    }

    RAILS.forEach(function (rail) {
      for (var i = 0; i < samples.length - 1; i += 1) {
        var a = samples[i];
        var b = samples[i + 1];
        vertices.push(a.x + rail.x, a.y + rail.y, a.z);
        vertices.push(b.x + rail.x, b.y + rail.y, b.z);
      }

      if (!rail.tick) return;
      for (var j = 0; j < samples.length; j += TICK_EVERY) {
        var s = samples[j];
        vertices.push(s.x + rail.x, s.y + rail.y, s.z);
        vertices.push(s.x + rail.x, s.y + rail.y + rail.tick, s.z);
      }
    });

    var geometry = new three.BufferGeometry();
    geometry.setAttribute('position', new three.Float32BufferAttribute(vertices, 3));

    var material = new three.LineBasicMaterial({
      color: new three.Color(0x7d93ad),
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      fog: true
    });

    var lines = new three.LineSegments(geometry, material);

    return {
      object3d: lines,

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

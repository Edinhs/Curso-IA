/**
 * Beat markers on the time axis.
 *
 * Every beat in `data/beats.js` gets a ring floating at its position on the
 * corridor. Rings brighten and widen as the camera approaches, then dim as it
 * passes — the spatial echo of the copy fading in and out on top.
 *
 * One `LineSegments` per beat looks wasteful next to instancing, but the count
 * is bounded by the number of beats in the course (tens, not thousands) and
 * each one needs its own colour and opacity. Instancing here would cost a
 * custom shader and buy nothing measurable.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;
  var path = AIC.scene.path;

  /** Outer ring + inner ring + four radial ticks, as one line buffer. */
  function buildGlyphGeometry(three) {
    var segments = config.nodes.ringSegments;
    var outer = config.nodes.ringRadius;
    var inner = outer * 0.26;
    var vertices = [];

    function ring(radius) {
      for (var i = 0; i < segments; i += 1) {
        var a0 = (i / segments) * Math.PI * 2;
        var a1 = ((i + 1) / segments) * Math.PI * 2;
        vertices.push(Math.cos(a0) * radius, Math.sin(a0) * radius, 0);
        vertices.push(Math.cos(a1) * radius, Math.sin(a1) * radius, 0);
      }
    }

    ring(outer);
    ring(inner);

    for (var t = 0; t < 4; t += 1) {
      var angle = (t / 4) * Math.PI * 2 + Math.PI / 4;
      vertices.push(Math.cos(angle) * outer * 1.16, Math.sin(angle) * outer * 1.16, 0);
      vertices.push(Math.cos(angle) * outer * 1.46, Math.sin(angle) * outer * 1.46, 0);
    }

    var geometry = new three.BufferGeometry();
    geometry.setAttribute('position', new three.Float32BufferAttribute(vertices, 3));
    return geometry;
  }

  AIC.scene.layers.createNodes = function (three, beats) {
    var group = new three.Group();
    var geometry = buildGlyphGeometry(three);
    var offset = new three.Vector3();
    var markers = [];

    beats.forEach(function (beat) {
      var material = new three.LineBasicMaterial({
        color: new three.Color(0x8fa7c4),
        transparent: true,
        opacity: 0.1,
        depthWrite: false
      });

      var mesh = new three.LineSegments(geometry, material);
      path.offsetAt(beat.depth, offset);
      mesh.position.set(offset.x, offset.y, path.zAt(beat.depth));
      group.add(mesh);

      markers.push({ beat: beat, mesh: mesh, material: material, intensity: 0 });
    });

    var toneIntensity = 1;

    return {
      object3d: group,

      update: function (frame) {
        var cameraZ = frame.camera.position.z;
        var damping = utils.damp(0.12, frame.delta);

        for (var i = 0; i < markers.length; i += 1) {
          var marker = markers[i];
          var distance = Math.abs(marker.mesh.position.z - cameraZ);
          var target = 1 - utils.smoothstep(0, config.nodes.focusRange, distance);

          marker.intensity = utils.lerp(marker.intensity, target, damping);
          marker.material.opacity = (0.07 + marker.intensity * 0.72) * toneIntensity;

          var scale = 1 + marker.intensity * 0.14;
          marker.mesh.scale.set(scale, scale, 1);
          marker.mesh.rotation.z = frame.time * 0.045 + i * 0.9;
        }
      },

      setTone: function (color, intensity) {
        toneIntensity = intensity === undefined ? 1 : intensity;
        markers.forEach(function (marker) { marker.material.color.set(color); });
      },

      dispose: function () {
        geometry.dispose();
        markers.forEach(function (marker) { marker.material.dispose(); });
        markers.length = 0;
      }
    };
  };
})(window.AIC);

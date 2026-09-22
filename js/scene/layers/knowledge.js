/**
 * The knowledge space.
 *
 * This layer replaces the identical rings the first version marked beats with.
 * A marker tells you *that* something is here; a construct tells you *what*.
 *
 * Two separate things drive a construct, and keeping them separate is what
 * makes the layer work:
 *
 *   FORM       how much of the structure has drawn itself, driven by the
 *              station's own choreography. Most of the camera's travel toward
 *              a concept happens while the *previous* station is departing, so
 *              distance alone would have every construct finished before the
 *              reader arrived — and the Machine Learning rules would dissolve
 *              with nobody watching.
 *
 *   BRIGHTNESS how strongly it reads, driven by where the camera actually is:
 *              a seed far ahead, full at the station, a residue once passed,
 *              and out of the way entirely as the camera goes by.
 *
 * Both are positions on a curve rather than triggered animations, so both are
 * correct scrolling backwards and correct after a jump.
 *
 * Each construct keeps the signature of its own era. A concept does not
 * change colour because you have moved on from it.
 *
 * Ahead of everything authored, the chapters still to be written sit as faint
 * seeds beyond the far plane, resolving as the journey advances. The road
 * continuing is part of the story.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;
  var path = AIC.scene.path;

  AIC.scene.layers.createKnowledge = function (three, beats) {
    var group = new three.Group();
    var mounted = [];
    var structure = new three.Color(config.lighting.structure);
    var offset = new three.Vector3();

    beats.forEach(function (beat) {
      if (!beat.construct) return;
      var construct = AIC.scene.constructs.create(beat.construct, three);
      if (!construct) {
        console.warn('[knowledge] unknown construct "' + beat.construct + '" on beat ' + beat.id);
        return;
      }

      // Beside the path rather than on it: the camera passes alongside the
      // concept instead of flying through it.
      path.offsetAt(beat.depth, offset);
      construct.object3d.position.set(
        offset.x + config.constructs.offsetX,
        offset.y + config.constructs.offsetY,
        path.zAt(beat.depth)
      );
      construct.object3d.scale.setScalar(config.constructs.scale);

      var era = AIC.data.getEra(beat.era);
      construct.setTone(structure, new three.Color(era ? era.accent : config.lighting.structure));

      group.add(construct.object3d);
      mounted.push({
        beat: beat,
        construct: construct,
        z: path.zAt(beat.depth),
        presence: 0,
        form: 0,
        targetForm: 0
      });
    });

    var byBeat = Object.create(null);
    mounted.forEach(function (entry) { byBeat[entry.beat.id] = entry; });

    // The station tells its construct how far to have formed. FORM spans
    // APPROACH through REVEAL, so the structure finishes assembling just as
    // the copy finishes arriving.
    AIC.core.bus.on(AIC.core.events.STATION_PHASE, function (payload) {
      var entry = byBeat[payload.stationId];
      if (entry) entry.targetForm = utils.progress(payload.state.progress, 0.03, 0.52);
    });

    // ── The chapters still ahead ───────────────────────────────────────────
    // Not decoration: this is the only place the reader can see that the
    // journey continues past the four stations that exist today.
    var horizon = AIC.scene.constructs.builder();
    var planned = AIC.data.chapters.filter(function (chapter) { return chapter.status !== 'preview'; });

    planned.forEach(function (chapter, index) {
      var t = 0.98 + (index / Math.max(planned.length - 1, 1)) * 0.48;
      path.offsetAt(Math.min(t, 1), offset);
      var z = path.zAt(t);
      horizon.point(offset.x, offset.y, { z: z, order: 0, kind: 0, size: 2.6 });
      if (index > 0) {
        var previousT = 0.98 + ((index - 1) / Math.max(planned.length - 1, 1)) * 0.48;
        var previous = path.offsetAt(Math.min(previousT, 1), new three.Vector3());
        // Dashed: a relation to something not yet reached.
        for (var d = 0; d < 4; d += 1) {
          var u0 = d / 4;
          var u1 = u0 + 0.45 / 4;
          horizon.segment(
            previous.x + (offset.x - previous.x) * u0, previous.y + (offset.y - previous.y) * u0,
            previous.x + (offset.x - previous.x) * u1, previous.y + (offset.y - previous.y) * u1,
            { order: 0, z: path.zAt(previousT + (t - previousT) * u0) }
          );
        }
      }
    });

    var horizonBuilt = horizon.build(three);
    horizonBuilt.materials.forEach(function (material) {
      material.uniforms.uForm.value = 1;
      material.uniforms.uBrightness.value = config.lighting.seed * 1.4;
      material.uniforms.uStructure.value.copy(structure);
    });
    group.add(horizonBuilt.object3d);

    var horizonMaterials = horizonBuilt.materials;
    var attention = 1;

    return {
      object3d: group,

      /**
       * Dimmed as a whole when the engineering layer takes over the frame.
       * Stored rather than applied, because `update` rewrites brightness every
       * frame and would otherwise undo it immediately.
       */
      setAttention: function (value) { attention = value; },

      update: function (frame) {
        var cameraZ = frame.camera.position.z;
        var damping = utils.damp(0.16, frame.delta);

        for (var h = 0; h < horizonMaterials.length; h += 1) {
          horizonMaterials[h].uniforms.uBrightness.value = config.lighting.seed * 1.4 * attention;
        }

        for (var i = 0; i < mounted.length; i += 1) {
          var entry = mounted[i];
          var signed = entry.z - cameraZ;
          var distance = Math.abs(signed);
          var behind = signed > 0;

          // How brightly it reads, from where the camera is.
          var proximity = 1 - utils.smoothstep(
            config.constructs.activeRange, config.constructs.seedRange, distance
          );
          var glow = Math.pow(proximity, behind ? 3.4 : 2.2);
          var floor = behind ? config.lighting.residue : config.lighting.seed;
          var brightness = floor + (config.lighting.active - floor) * glow;

          // And it steps out of the way as the camera goes by.
          brightness *= utils.smoothstep(
            config.constructs.passRange[0], config.constructs.passRange[1], distance
          );

          entry.form = utils.lerp(entry.form, entry.targetForm, damping);
          entry.presence = utils.lerp(entry.presence, glow, damping);

          entry.construct.setForm(entry.form);
          entry.construct.setBrightness(brightness * attention);
          if (entry.construct.animate) {
            entry.construct.animate(entry.construct, frame, entry.presence);
          }
        }
      },

      resize: function (width, height) {
        var halfFov = (config.stage.cameraFov * Math.PI) / 360;
        var scale = height / (2 * Math.tan(halfFov));
        mounted.forEach(function (entry) { entry.construct.setScale(scale); });
        horizonMaterials.forEach(function (material) { material.uniforms.uScale.value = scale; });
      },

  

      dispose: function () {
        mounted.forEach(function (entry) { entry.construct.dispose(); });
        horizonBuilt.object3d.traverse(function (child) {
          if (child.geometry) child.geometry.dispose();
        });
        horizonMaterials.forEach(function (material) { material.dispose(); });
      }
    };
  };
})(window.AIC);

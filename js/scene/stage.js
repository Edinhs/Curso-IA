/**
 * The journey stage — where scroll becomes camera movement.
 *
 * ── Camera language ───────────────────────────────────────────────────────
 * Travelling and dolly. Nothing else. The camera advances along the path,
 * looks slightly ahead so curves read as banking, and steps sideways when the
 * engineering layer claims the right half of the frame. No spins, no zooms, no
 * roll beyond a whisper. The camera is exploring, not performing.
 *
 * It eases toward the scroll position rather than snapping to it, which
 * removes trackpad jitter without introducing lag the reader can feel. Fast
 * scrolling stays readable because the easing is a follow, not a delay: the
 * camera is always heading where the scroll already is.
 *
 * ── Light ─────────────────────────────────────────────────────────────────
 * The space itself is graphite and white. The era signature reaches the fog
 * as a trace and the constructs as their own tint — it is never washed over
 * the whole frame. Colour that is everywhere is not a signal.
 *
 * ── Density ───────────────────────────────────────────────────────────────
 * The atmosphere thickens as the journey advances. 1950 is nearly vacuum.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;
  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var path = AIC.scene.path;

  AIC.scene.createStage = function (canvas) {
    var context = AIC.scene.createRenderer(canvas);
    var three = context.three;

    var dust = context.add(AIC.scene.layers.createDust(three));
    var corridor = context.add(AIC.scene.layers.createCorridor(three));
    var knowledge = context.add(AIC.scene.layers.createKnowledge(three, AIC.data.beats));

    var targetProgress = 0;
    var easedProgress = 0;
    var pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };

    var structure = new three.Color(config.lighting.structure);
    var signature = new three.Color(config.lighting.structure);
    var targetSignature = new three.Color(config.lighting.structure);
    var fogTone = new three.Color();

    var here = new three.Vector3();
    var ahead = new three.Vector3();

    /** Falls when the engineering layer opens; also pushes the camera aside. */
    var attention = 1;
    var targetAttention = 1;

    function compositionShift() {
      return AIC.core.capabilities.compact
        ? config.stage.compositionShiftCompact
        : config.stage.compositionShift;
    }

    function placeCamera(t, damping) {
      path.offsetAt(t, here);
      path.offsetAt(Math.min(t + 0.05, 1.15), ahead);

      // The dolly: as the technical layer slides in from the right, the camera
      // steps left so the construct is displaced rather than covered.
      var dolly = (1 - attention) * config.stage.deepDiveDolly *
        (AIC.core.capabilities.compact ? 0 : 1);
      var shift = compositionShift() - dolly;

      context.camera.position.set(
        here.x + shift + pointer.x,
        here.y + pointer.y,
        path.zAt(t) + config.stage.standoff
      );
      context.camera.lookAt(ahead.x + shift * 0.5, ahead.y, path.zAt(t + 0.05));

      // A whisper of roll in the direction of the turn. Any more is nauseating.
      var bank = (ahead.x - here.x) * 0.009;
      context.camera.rotation.z = utils.lerp(context.camera.rotation.z, bank, damping);
    }

    context.onFrame(function (frame) {
      var reduced = AIC.core.motion.reduced;
      var damping = reduced ? 1 : utils.damp(config.scroll.cameraEase, frame.delta);

      easedProgress = reduced ? targetProgress : utils.lerp(easedProgress, targetProgress, damping);

      if (!reduced) {
        var pointerDamping = utils.damp(config.stage.parallax.ease, frame.delta);
        pointer.x = utils.lerp(pointer.x, pointer.targetX, pointerDamping);
        pointer.y = utils.lerp(pointer.y, pointer.targetY, pointerDamping);
      }

      attention = reduced
        ? targetAttention
        : utils.lerp(attention, targetAttention, utils.damp(0.12, frame.delta));

      placeCamera(easedProgress, damping);

      signature.lerp(targetSignature, reduced ? 1 : utils.damp(0.04, frame.delta));

      // The universe fills in as the journey advances: vacuum, then atmosphere.
      var density = 0.5 + easedProgress * 0.5;
      // On a single-column layout the copy sits over the construct rather than
      // beside it, so the whole space steps back to keep the text first.
      var weight = AIC.core.capabilities.compact ? 0.5 : 1;

      dust.setTone(structure, 0.72 * density * attention * weight);
      corridor.setTone(structure, 0.3 * attention * weight);
      knowledge.setAttention(attention * weight);

      // Only a trace of the signature reaches the fog — enough that depth
      // feels lit rather than black, never enough to tint the frame.
      fogTone.copy(structure).multiplyScalar(0.02).lerp(signature, config.lighting.fogSignature);
      context.scene.fog.color.copy(fogTone);
      context.renderer.setClearColor(fogTone, 1);
    });

    var renderIfStill = utils.rafThrottle(function () {
      if (!context.isRunning) context.renderOnce();
    });

    bus.on(events.JOURNEY_PROGRESS, function (payload) {
      targetProgress = payload.progress;
      renderIfStill();
    });

    bus.on(events.ERA_CHANGE, function (payload) {
      var era = AIC.data.getEra(payload.eraId);
      if (era) targetSignature.set(era.accent);
      renderIfStill();
    });

    bus.on(events.DEEPDIVE_TOGGLE, function (payload) {
      targetAttention = payload.open ? 0.26 : 1;
      renderIfStill();
    });

    bus.on(events.MOTION_CHANGE, function (payload) {
      if (payload.reduced) {
        context.stop();
        context.renderOnce();
      } else {
        context.start();
      }
    });

    if (!AIC.core.capabilities.coarsePointer) {
      window.addEventListener('pointermove', function (event) {
        if (AIC.core.motion.reduced) return;
        var strength = config.stage.parallax.strength;
        pointer.targetX = ((event.clientX / window.innerWidth) - 0.5) * strength;
        pointer.targetY = ((event.clientY / window.innerHeight) - 0.5) * -strength * 0.6;
      }, { passive: true });
    }

    return {
      context: context,

      /** Read by the debug overlay. */
      get telemetry() {
        return {
          progress: easedProgress,
          cameraZ: context.camera.position.z,
          attention: attention
        };
      },

      start: function () {
        if (AIC.core.motion.reduced) context.renderOnce();
        else context.start();
      },

      dispose: function () { context.dispose(); }
    };
  };
})(window.AIC);

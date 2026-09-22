/**
 * The journey stage — where scroll becomes camera movement.
 *
 * Composition: the copy lives in a column on the left, so the camera steps
 * sideways and the corridor resolves to the right of the text. On narrow
 * screens the corridor re-centres and sits behind the copy instead.
 *
 * Motion discipline:
 *   · the camera eases toward the scroll position rather than snapping to it,
 *     which removes the jitter of a trackpad without adding lag you can feel
 *   · it looks slightly *ahead* on the path, so turns read as banking
 *   · with reduced motion the loop never starts: the scene renders one frame
 *     per scroll update and is otherwise perfectly still
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
    var nodes = context.add(AIC.scene.layers.createNodes(three, AIC.data.beats));

    var targetProgress = 0;
    var easedProgress = 0;
    var pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };

    var tone = new three.Color(0x8fa7c4);
    var targetTone = new three.Color(0x8fa7c4);
    var fogTone = new three.Color(0x05070a);

    var here = new three.Vector3();
    var ahead = new three.Vector3();

    /**
     * Drops when the engineering layer is open. The panel unfolds over the
     * right half of the frame, exactly where the corridor lives, so the
     * backdrop steps back instead of competing with the diagram.
     */
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

      var shift = compositionShift();
      context.camera.position.set(
        here.x + shift + pointer.x,
        here.y + pointer.y,
        path.zAt(t) + config.stage.standoff
      );
      context.camera.lookAt(ahead.x + shift * 0.5, ahead.y, path.zAt(t + 0.05));

      // A whisper of roll in the direction of the turn. Any more is nauseating.
      var bank = (ahead.x - here.x) * 0.012;
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

      placeCamera(easedProgress, damping);

      tone.lerp(targetTone, reduced ? 1 : utils.damp(0.05, frame.delta));
      attention = reduced
        ? targetAttention
        : utils.lerp(attention, targetAttention, utils.damp(0.14, frame.delta));

      dust.setTone(tone, 0.85 * attention);
      corridor.setTone(tone, 0.38 * attention);
      nodes.setTone(tone, attention);

      // The fog carries a trace of the era colour so depth feels lit, not black.
      fogTone.setRGB(0.02, 0.027, 0.039).lerp(tone, 0.07);
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
      if (era) targetTone.set(era.accent);
      renderIfStill();
    });

    bus.on(events.DEEPDIVE_TOGGLE, function (payload) {
      targetAttention = payload.open ? 0.3 : 1;
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

      start: function () {
        if (AIC.core.motion.reduced) context.renderOnce();
        else context.start();
      },

      dispose: function () { context.dispose(); }
    };
  };
})(window.AIC);

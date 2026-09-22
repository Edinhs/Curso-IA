/**
 * WebGL plumbing: context, camera, resize and the single animation frame loop.
 *
 * Nothing here knows about the course. It owns the expensive resources and the
 * rules that keep a corporate laptop comfortable:
 *   · pixel ratio is capped (retina is beautiful and expensive)
 *   · resize work is debounced and only touches the renderer once
 *   · the loop stops completely when the tab is hidden or the canvas scrolls away
 *   · a lost WebGL context is reported instead of silently freezing the scene
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;

  AIC.scene.createRenderer = function (canvas) {
    var THREE = window.THREE;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !AIC.core.capabilities.compact,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });

    renderer.setClearColor(0x05070a, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, config.stage.fogDensity);

    var camera = new THREE.PerspectiveCamera(
      config.stage.cameraFov, 1, config.stage.cameraNear, config.stage.cameraFar
    );

    var layers = [];
    var frameId = null;
    var elapsed = 0;
    var lastStamp = 0;
    var running = false;
    var visible = true;
    var contextLost = false;
    var onFrame = null;

    function pixelRatio() {
      var cap = AIC.core.capabilities.compact
        ? config.performance.maxPixelRatioMobile
        : config.performance.maxPixelRatio;
      return Math.min(window.devicePixelRatio || 1, cap);
    }

    function resize() {
      var width = canvas.clientWidth || window.innerWidth;
      var height = canvas.clientHeight || window.innerHeight;
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();

      layers.forEach(function (layer) {
        if (layer.resize) layer.resize(width, height);
      });
    }

    /** Seconds since the previous frame, clamped so a paused tab cannot jump. */
    function advance(stamp) {
      var delta = lastStamp ? Math.min((stamp - lastStamp) / 1000, 0.05) : 0;
      lastStamp = stamp;
      elapsed += delta;
      return delta;
    }

    function tick(stamp) {
      frameId = window.requestAnimationFrame(tick);
      if (contextLost) return;

      var delta = advance(stamp);
      var time = elapsed;

      if (onFrame) onFrame({ time: time, delta: delta, camera: camera, scene: scene });

      for (var i = 0; i < layers.length; i += 1) {
        if (layers[i].update) layers[i].update({ time: time, delta: delta, camera: camera });
      }
      renderer.render(scene, camera);
    }

    function start() {
      if (running || contextLost) return;
      running = true;
      lastStamp = 0; // discard the pause duration so nothing jumps
      frameId = window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
    }

    /** Renders exactly one frame — used in reduced-motion mode, on scroll only. */
    function renderOnce() {
      if (contextLost) return;
      var delta = advance(window.performance.now());
      var frame = { time: elapsed, delta: delta, camera: camera, scene: scene };
      if (onFrame) onFrame(frame);
      layers.forEach(function (layer) {
        if (layer.update) layer.update(frame);
      });
      renderer.render(scene, camera);
    }

    function setVisible(nextVisible) {
      if (visible === nextVisible) return;
      visible = nextVisible;
      if (visible && !AIC.core.motion.reduced) start();
      else if (!visible) stop();
    }

    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      contextLost = true;
      stop();
      document.documentElement.classList.add('webgl-lost');
      console.warn('[scene] WebGL context lost — falling back to the static backdrop');
    });

    canvas.addEventListener('webglcontextrestored', function () {
      contextLost = false;
      document.documentElement.classList.remove('webgl-lost');
      resize();
      start();
    });

    if (config.performance.pauseWhenHidden) {
      document.addEventListener('visibilitychange', function () {
        setVisible(!document.hidden);
      });
    }

    window.addEventListener('resize', utils.debounce(resize, 120), { passive: true });
    // Mobile browsers fire `resize` on every toolbar nudge; orientation is the
    // change that actually matters, so it gets an immediate pass.
    window.addEventListener('orientationchange', function () {
      window.setTimeout(resize, 200);
    });

    resize();

    return {
      three: THREE,
      scene: scene,
      camera: camera,
      renderer: renderer,

      add: function (layer) {
        layers.push(layer);
        if (layer.object3d) scene.add(layer.object3d);
        return layer;
      },

      onFrame: function (handler) { onFrame = handler; },

      start: start,
      stop: stop,
      renderOnce: renderOnce,
      resize: resize,
      setVisible: setVisible,

      get isRunning() { return running; },

      dispose: function () {
        stop();
        layers.forEach(function (layer) { if (layer.dispose) layer.dispose(); });
        layers.length = 0;
        renderer.dispose();
      }
    };
  };
})(window.AIC);

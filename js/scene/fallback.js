/**
 * 2D stand-in for the corridor.
 *
 * Used when WebGL is unavailable or the context is lost — older corporate
 * images, remote desktop sessions and locked-down VMs all hit this path.
 *
 * It is the same idea reduced to its essentials: a pinhole projection of the
 * rails and a sparse dust field. It costs a few hundred `lineTo` calls per
 * frame, which any machine that can render a web page can afford.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;
  var bus = AIC.core.bus;
  var events = AIC.core.events;

  var FOCAL = 780;
  var DEPTH = 760;
  var RAILS = [
    { x: -19, y: 7.5 },
    { x: 19, y: 7.5 },
    { x: -27, y: -11 },
    { x: 27, y: -11 }
  ];

  AIC.scene.createFallback = function (canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return { start: function () {}, dispose: function () {} };

    var random = utils.seededRandom(19560801); // Dartmouth, as a seed
    var particles = [];
    var particleCount = AIC.core.capabilities.compact ? 140 : 320;

    for (var i = 0; i < particleCount; i += 1) {
      var angle = random() * Math.PI * 2;
      var radius = 10 + Math.pow(random(), 0.55) * 64;
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.7,
        z: random() * DEPTH,
        alpha: 0.2 + random() * 0.6
      });
    }

    var width = 0;
    var height = 0;
    var ratio = 1;
    var travel = 0;
    var targetTravel = 0;
    var accent = { r: 143, g: 167, b: 196 };
    var targetAccent = { r: 143, g: 167, b: 196 };
    var frameId = null;
    var running = false;
    var lastTime = 0;

    function resize() {
      ratio = Math.min(window.devicePixelRatio || 1, config.performance.maxPixelRatio);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }

    function project(x, y, z) {
      if (z <= 1) return null;
      var scale = FOCAL / z;
      return {
        x: width * 0.5 + x * scale,
        y: height * 0.52 + y * scale,
        scale: scale
      };
    }

    function rgba(alpha) {
      return 'rgba(' + Math.round(accent.r) + ',' + Math.round(accent.g) + ',' +
        Math.round(accent.b) + ',' + alpha.toFixed(3) + ')';
    }

    function drawRails() {
      ctx.lineWidth = 1;
      RAILS.forEach(function (rail) {
        ctx.beginPath();
        var started = false;
        for (var z = 24; z < DEPTH; z += 26) {
          var point = project(rail.x, rail.y, z);
          if (!point) continue;
          if (started) ctx.lineTo(point.x, point.y);
          else { ctx.moveTo(point.x, point.y); started = true; }
        }
        var gradient = ctx.createLinearGradient(0, height, 0, height * 0.35);
        gradient.addColorStop(0, rgba(0.26));
        gradient.addColorStop(1, rgba(0));
        ctx.strokeStyle = gradient;
        ctx.stroke();
      });
    }

    function drawDust() {
      for (var i = 0; i < particles.length; i += 1) {
        var particle = particles[i];
        var z = ((particle.z - travel) % DEPTH + DEPTH) % DEPTH;
        var point = project(particle.x, particle.y, z + 12);
        if (!point) continue;

        // Same discipline as the WebGL layer: nothing renders close enough to
        // the lens to become a blob, and size is capped either way.
        var fade = (1 - utils.smoothstep(DEPTH * 0.45, DEPTH * 0.95, z)) *
          utils.smoothstep(24, 150, z);
        var alpha = particle.alpha * fade * 0.85;
        if (alpha < 0.012) continue;

        var radius = Math.min(Math.max(0.5, point.scale * 0.9), 2.4);
        ctx.fillStyle = rgba(alpha);
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function draw() {
      if (!width || !height) return;
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, width, height);
      drawRails();
      drawDust();
    }

    function tick(now) {
      frameId = window.requestAnimationFrame(tick);
      var delta = Math.min((now - lastTime) / 1000 || 0, 0.05);
      lastTime = now;

      var damping = utils.damp(0.06, delta);
      travel = utils.lerp(travel, targetTravel, damping);
      accent.r = utils.lerp(accent.r, targetAccent.r, damping);
      accent.g = utils.lerp(accent.g, targetAccent.g, damping);
      accent.b = utils.lerp(accent.b, targetAccent.b, damping);

      // Slow constant drift so the field never looks frozen between scrolls.
      travel += delta * 8;
      draw();
    }

    function start() {
      if (AIC.core.motion.reduced) { draw(); return; }
      if (running) return;
      running = true;
      lastTime = window.performance.now();
      frameId = window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
    }

    bus.on(events.JOURNEY_PROGRESS, function (payload) {
      targetTravel = payload.progress * DEPTH * 2.4;
      if (!running) { travel = targetTravel; draw(); }
    });

    bus.on(events.ERA_CHANGE, function (payload) {
      var era = AIC.data.getEra(payload.eraId);
      if (!era) return;
      targetAccent = {
        r: parseInt(era.accent.slice(1, 3), 16),
        g: parseInt(era.accent.slice(3, 5), 16),
        b: parseInt(era.accent.slice(5, 7), 16)
      };
      if (!running) { accent = targetAccent; draw(); }
    });

    bus.on(events.MOTION_CHANGE, function (payload) {
      if (payload.reduced) { stop(); draw(); } else start();
    });

    window.addEventListener('resize', utils.debounce(resize, 140), { passive: true });
    resize();

    return {
      start: start,
      dispose: stop
    };
  };
})(window.AIC);

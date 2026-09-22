/**
 * Atmospheric dust.
 *
 * A single draw call. Particles never move on the CPU: the vertex shader wraps
 * each one into the slab of space in front of the camera, so the field is
 * effectively infinite while the buffer stays fixed and tiny.
 *
 * The layout is generated from a fixed seed — the starfield must look the same
 * on every reload, otherwise the opening reads as random noise instead of a
 * designed frame.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;
  var utils = AIC.core.utils;

  var VERTEX_SHADER = [
    'uniform float uCameraZ;',
    'uniform float uDepth;',
    'uniform float uSize;',
    'uniform float uTime;',
    'uniform float uScale;',
    'uniform float uIntensity;',
    'attribute float aSeed;',
    'varying float vAlpha;',
    'void main() {',
    // Wrap into [0, uDepth) ahead of the camera. GLSL mod() is always positive here.
    '  float zRel = mod(position.z - uCameraZ, uDepth);',
    '  float drift = sin(uTime * 0.18 + aSeed * 6.2831) * 0.9;',
    '  vec3 world = vec3(position.x + drift, position.y + drift * 0.4, uCameraZ - zRel);',
    '  vec4 mv = modelViewMatrix * vec4(world, 1.0);',
    // Fade in from the fog wall, and fade out long before a mote reaches the
    // lens — a particle a few metres from the camera is a bokeh blob, not dust.
    '  float far = 1.0 - smoothstep(uDepth * 0.45, uDepth * 0.92, zRel);',
    '  float near = smoothstep(26.0, 150.0, zRel);',
    '  vAlpha = far * near * uIntensity * (0.3 + aSeed * 0.62);',
    // Perspective point size in world units, clamped so nothing can blow up.
    '  gl_PointSize = min(uSize * uScale / max(-mv.z, 1.0), 5.0);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var FRAGMENT_SHADER = [
    'uniform vec3 uColor;',
    'varying float vAlpha;',
    'void main() {',
    '  float d = length(gl_PointCoord - vec2(0.5));',
    '  float mask = smoothstep(0.5, 0.12, d);',
    '  if (mask * vAlpha < 0.004) discard;',
    '  gl_FragColor = vec4(uColor, mask * vAlpha);',
    '}'
  ].join('\n');

  AIC.scene.layers.createDust = function (three) {
    var count = AIC.core.capabilities.compact ? config.dust.countMobile : config.dust.count;
    var random = utils.seededRandom(20170612); // the Transformer paper, as a seed
    var positions = new Float32Array(count * 3);
    var seeds = new Float32Array(count);

    for (var i = 0; i < count; i += 1) {
      // Polar distribution with a hollow core, so the corridor centre stays clear.
      var angle = random() * Math.PI * 2;
      var radius = config.dust.radius * (0.18 + Math.pow(random(), 0.55) * 0.82);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.62;
      positions[i * 3 + 2] = -random() * config.dust.depth;
      seeds[i] = random();
    }

    var geometry = new three.BufferGeometry();
    geometry.setAttribute('position', new three.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new three.BufferAttribute(seeds, 1));

    var material = new three.ShaderMaterial({
      uniforms: {
        uCameraZ: { value: 0 },
        uDepth: { value: config.dust.depth },
        uSize: { value: config.dust.size },
        uTime: { value: 0 },
        uScale: { value: 800 },
        uIntensity: { value: 1 },
        uColor: { value: new three.Color(0x9fb6d0) }
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: three.AdditiveBlending
    });

    var points = new three.Points(geometry, material);
    points.frustumCulled = false; // positions are computed in the shader

    return {
      object3d: points,

      update: function (frame) {
        material.uniforms.uTime.value = frame.time;
        material.uniforms.uCameraZ.value = frame.camera.position.z;
      },

      resize: function (width, height) {
        // Projection scale: world-space size → pixels at one unit of depth.
        var halfFov = (config.stage.cameraFov * Math.PI) / 360;
        material.uniforms.uScale.value = height / (2 * Math.tan(halfFov));
      },

      setTone: function (color, intensity) {
        material.uniforms.uColor.value.set(color);
        material.uniforms.uIntensity.value = intensity;
      },

      dispose: function () {
        geometry.dispose();
        material.dispose();
      }
    };
  };
})(window.AIC);

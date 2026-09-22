/**
 * Construct kit — the drawing language of the knowledge space.
 *
 * A *construct* is the spatial form of one concept. It is not a marker: the
 * shape says what the concept is. A single gate for Turing, one point becoming
 * many for Dartmouth, a rule grid dissolving into a learned cloud for Machine
 * Learning, a web of weights for the Transformer.
 *
 * Two ideas make the whole system work, and both live here:
 *
 * 1. **Constructs draw themselves.** Every vertex carries an `aOrder`: the
 *    point in the construct's formation at which it appears. Drive `uForm`
 *    from 0 to 1 and the structure assembles in a meaningful sequence —
 *    centre first, then spokes, then relations. Drive it back down and it
 *    disassembles. Nothing is a one-way animation.
 *
 * 2. **Geometry can be temporary.** A vertex also carries `aFade`: the point
 *    at which it leaves again. This is how the rules dissolve as learning
 *    appears, and how an attention weight can exist only while it matters.
 *
 * Line vocabulary, consistent with css/tokens.css:
 *   continuous  → evolution      (`kind: 0`, structural white)
 *   signature   → the live idea  (`kind: 1`, the era tint)
 *   temporary   → attention      (any line with an `aFade`)
 *
 * One material serves every construct, so the whole space costs a handful of
 * draw calls however many concepts accumulate in it.
 */
(function (AIC) {
  'use strict';

  var config = AIC.core.config;

  var LINE_VERTEX = [
    'attribute float aOrder;',
    'attribute float aFade;',
    'attribute float aKind;',
    'attribute float aGroup;',
    'uniform float uForm;',
    'uniform float uFocus;',
    'uniform float uFocusStrength;',
    'varying float vAlpha;',
    'varying float vKind;',
    'void main() {',
    // Appears when the formation passes this vertex's order…
    '  float appear = smoothstep(aOrder - 0.12, aOrder, uForm);',
    // …and leaves again if it was only ever temporary.
    '  float vanish = 1.0 - smoothstep(aFade, aFade + 0.14, uForm);',
    '  float weight = 1.0;',
    '  if (uFocusStrength > 0.0 && aGroup >= 0.0) {',
    '    float d = aGroup - uFocus;',
    '    weight = mix(1.0, 0.18 + 1.5 * exp(-d * d * 1.1), uFocusStrength);',
    '  }',
    '  vAlpha = appear * vanish * weight;',
    '  vKind = aKind;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  var LINE_FRAGMENT = [
    'uniform vec3 uStructure;',
    'uniform vec3 uSignature;',
    'uniform float uBrightness;',
    'varying float vAlpha;',
    'varying float vKind;',
    'void main() {',
    '  float a = vAlpha * uBrightness;',
    '  if (a < 0.004) discard;',
    '  gl_FragColor = vec4(mix(uStructure, uSignature, vKind), a);',
    '}'
  ].join('\n');

  var POINT_VERTEX = [
    'attribute float aOrder;',
    'attribute float aFade;',
    'attribute float aKind;',
    'attribute float aSize;',
    'uniform float uForm;',
    'uniform float uScale;',
    'varying float vAlpha;',
    'varying float vKind;',
    'void main() {',
    '  float appear = smoothstep(aOrder - 0.12, aOrder, uForm);',
    '  float vanish = 1.0 - smoothstep(aFade, aFade + 0.14, uForm);',
    '  vAlpha = appear * vanish;',
    '  vKind = aKind;',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = clamp(aSize * uScale / max(-mv.z, 1.0), 1.0, 26.0);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var POINT_FRAGMENT = [
    'uniform vec3 uStructure;',
    'uniform vec3 uSignature;',
    'uniform float uBrightness;',
    'varying float vAlpha;',
    'varying float vKind;',
    'void main() {',
    '  float d = length(gl_PointCoord - vec2(0.5));',
    '  float core = smoothstep(0.5, 0.06, d);',
    '  float a = vAlpha * uBrightness * core;',
    '  if (a < 0.004) discard;',
    '  gl_FragColor = vec4(mix(uStructure, uSignature, vKind), a);',
    '}'
  ].join('\n');

  function uniforms(three) {
    return {
      uForm: { value: 0 },
      uBrightness: { value: 0 },
      uScale: { value: 800 },
      uFocus: { value: -1 },
      uFocusStrength: { value: 0 },
      uStructure: { value: new three.Color(config.lighting.structure) },
      uSignature: { value: new three.Color(config.lighting.structure) }
    };
  }

  /**
   * Accumulates segments and points, then bakes them into two buffers.
   * Constructs describe themselves with this and never touch three.js directly.
   */
  function builder() {
    var lines = { position: [], order: [], fade: [], kind: [], group: [] };
    var points = { position: [], order: [], fade: [], kind: [], size: [] };

    function lineVertex(x, y, z, o) {
      lines.position.push(x, y, z || 0);
      lines.order.push(o.order === undefined ? 0 : o.order);
      lines.fade.push(o.fade === undefined ? 2 : o.fade);
      lines.kind.push(o.kind === undefined ? 0 : o.kind);
      lines.group.push(o.group === undefined ? -1 : o.group);
    }

    var api = {
      /** A straight segment. `options` carries order / fade / kind / group. */
      segment: function (ax, ay, bx, by, options) {
        var o = options || {};
        lineVertex(ax, ay, o.z, o);
        lineVertex(bx, by, o.z, o);
        return api;
      },

      /** A polyline through [x, y] pairs. */
      polyline: function (pointList, options) {
        for (var i = 0; i < pointList.length - 1; i += 1) {
          api.segment(pointList[i][0], pointList[i][1],
            pointList[i + 1][0], pointList[i + 1][1], options);
        }
        return api;
      },

      /** A circle, drawn as `segments` chords. */
      ring: function (cx, cy, radius, segments, options) {
        for (var i = 0; i < segments; i += 1) {
          var a0 = (i / segments) * Math.PI * 2;
          var a1 = ((i + 1) / segments) * Math.PI * 2;
          var o = Object.assign({}, options || {});
          // Rings draw themselves round, not all at once.
          if (options && options.sweep) {
            o.order = options.order + (i / segments) * options.sweep;
          }
          api.segment(
            cx + Math.cos(a0) * radius, cy + Math.sin(a0) * radius,
            cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius, o
          );
        }
        return api;
      },

      /** A dashed run between two points — the relation line. */
      dashed: function (ax, ay, bx, by, dashes, options) {
        for (var i = 0; i < dashes; i += 1) {
          var t0 = i / dashes;
          var t1 = t0 + (0.55 / dashes);
          api.segment(
            ax + (bx - ax) * t0, ay + (by - ay) * t0,
            ax + (bx - ax) * t1, ay + (by - ay) * t1, options
          );
        }
        return api;
      },

      point: function (x, y, options) {
        var o = options || {};
        points.position.push(x, y, o.z || 0);
        points.order.push(o.order === undefined ? 0 : o.order);
        points.fade.push(o.fade === undefined ? 2 : o.fade);
        points.kind.push(o.kind === undefined ? 0 : o.kind);
        points.size.push(o.size === undefined ? 2 : o.size);
        return api;
      },

      get lineCount() { return lines.position.length / 6; },
      get pointCount() { return points.position.length / 3; },

      build: function (three) {
        var group = new three.Group();
        var materials = [];

        if (lines.position.length) {
          var lineGeometry = new three.BufferGeometry();
          lineGeometry.setAttribute('position', new three.Float32BufferAttribute(lines.position, 3));
          lineGeometry.setAttribute('aOrder', new three.Float32BufferAttribute(lines.order, 1));
          lineGeometry.setAttribute('aFade', new three.Float32BufferAttribute(lines.fade, 1));
          lineGeometry.setAttribute('aKind', new three.Float32BufferAttribute(lines.kind, 1));
          lineGeometry.setAttribute('aGroup', new three.Float32BufferAttribute(lines.group, 1));

          var lineMaterial = new three.ShaderMaterial({
            uniforms: uniforms(three),
            vertexShader: LINE_VERTEX,
            fragmentShader: LINE_FRAGMENT,
            transparent: true,
            depthWrite: false,
            blending: three.AdditiveBlending
          });
          materials.push(lineMaterial);
          group.add(new three.LineSegments(lineGeometry, lineMaterial));
        }

        if (points.position.length) {
          var pointGeometry = new three.BufferGeometry();
          pointGeometry.setAttribute('position', new three.Float32BufferAttribute(points.position, 3));
          pointGeometry.setAttribute('aOrder', new three.Float32BufferAttribute(points.order, 1));
          pointGeometry.setAttribute('aFade', new three.Float32BufferAttribute(points.fade, 1));
          pointGeometry.setAttribute('aKind', new three.Float32BufferAttribute(points.kind, 1));
          pointGeometry.setAttribute('aSize', new three.Float32BufferAttribute(points.size, 1));

          var pointMaterial = new three.ShaderMaterial({
            uniforms: uniforms(three),
            vertexShader: POINT_VERTEX,
            fragmentShader: POINT_FRAGMENT,
            transparent: true,
            depthWrite: false,
            blending: three.AdditiveBlending
          });
          materials.push(pointMaterial);
          group.add(new three.Points(pointGeometry, pointMaterial));
        }

        return { object3d: group, materials: materials };
      }
    };

    return api;
  }

  var definitions = Object.create(null);

  AIC.scene.constructs = {
    builder: builder,

    /**
     * Registers a construct. A beat names one by id (`construct: 'turing-gate'`);
     * a beat with no construct simply gets no structure in space, which is a
     * valid thing for a beat to be.
     */
    define: function (id, factory) {
      definitions[id] = factory;
    },

    /**
     * Builds one, returning the object to mount plus the handles the knowledge
     * layer drives: how far it has formed, how brightly it is lit, and — for
     * constructs that have one — a live focus.
     */
    create: function (id, three) {
      var factory = definitions[id];
      if (!factory) return null;

      var spec = factory(builder(), { three: three });
      var built = spec.shape.build(three);
      var materials = built.materials;

      return {
        id: id,
        object3d: built.object3d,
        radius: spec.radius || 10,

        setForm: function (form) {
          for (var i = 0; i < materials.length; i += 1) materials[i].uniforms.uForm.value = form;
        },

        setBrightness: function (value) {
          for (var i = 0; i < materials.length; i += 1) materials[i].uniforms.uBrightness.value = value;
        },

        setTone: function (structure, signature) {
          for (var i = 0; i < materials.length; i += 1) {
            materials[i].uniforms.uStructure.value.copy(structure);
            materials[i].uniforms.uSignature.value.copy(signature);
          }
        },

        setScale: function (scale) {
          for (var i = 0; i < materials.length; i += 1) materials[i].uniforms.uScale.value = scale;
        },

        setFocus: function (focus, strength) {
          for (var i = 0; i < materials.length; i += 1) {
            materials[i].uniforms.uFocus.value = focus;
            materials[i].uniforms.uFocusStrength.value = strength;
          }
        },

        /** Optional per-frame behaviour declared by the construct itself. */
        animate: spec.animate || null,

        dispose: function () {
          built.object3d.traverse(function (child) {
            if (child.geometry) child.geometry.dispose();
          });
          materials.forEach(function (material) { material.dispose(); });
        }
      };
    }
  };
})(window.AIC);

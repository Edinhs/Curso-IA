/**
 * Entry point used to build `vendor/three/three.slim.js`.
 *
 * Three.js only ships ES modules. The course must run from `file://`, where
 * ES modules are blocked by CORS, so we pre-bundle the exact subset we use
 * into a classic script that exposes a global `THREE`.
 *
 * Adding a new Three.js feature? Export it here and re-run `node tools/vendor.mjs`.
 */
export {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  Color,
  Vector3,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  LineSegments,
  LineBasicMaterial,
  AdditiveBlending,
  FogExp2,
  SRGBColorSpace,
  NoToneMapping
} from 'three';

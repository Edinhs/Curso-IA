/**
 * Single global entry point for the whole course.
 *
 * Every other file attaches to this object. We deliberately avoid ES modules:
 * the experience must open by double-clicking `index.html`, and browsers refuse
 * to load `type="module"` scripts over the `file://` protocol.
 *
 * Load order is declared once, in `index.html`.
 */
window.AIC = window.AIC || {
  core: {},
  data: {},
  scene: { layers: {} },
  scroll: {},
  ui: {},
  labs: {}
};

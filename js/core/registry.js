/**
 * Registry for interactive modules ("labs").
 *
 * This is the extension point for everything on the roadmap — Tokenizer Lab,
 * Embedding Space 3D, Attention Simulator, RAG Simulator, Prompt Builder,
 * Agent Simulator, quizzes. A lab is a factory that receives a mount element
 * plus its own data and returns an optional teardown handle.
 *
 *   AIC.core.registry.define('tokenizer-lab', function (mount, context) {
 *     mount.appendChild(...);
 *     return { destroy: function () {} };
 *   });
 *
 * A beat references a lab by id (`lab: 'tokenizer-lab'`). If the module is not
 * loaded yet, the beat renders a labelled placeholder instead of throwing, so
 * content authors can reference a lab before it exists.
 */
(function (AIC) {
  'use strict';

  var labs = Object.create(null);

  AIC.core.registry = {
    define: function (id, factory) {
      if (labs[id]) console.warn('[registry] lab "' + id + '" redefined');
      labs[id] = factory;
    },

    has: function (id) {
      return !!labs[id];
    },

    /** Instantiates a lab lazily — nothing heavy runs until a beat asks for it. */
    mount: function (id, mountElement, context) {
      var factory = labs[id];
      if (!factory) return null;
      try {
        return factory(mountElement, context || {}) || null;
      } catch (error) {
        console.error('[registry] lab "' + id + '" failed to mount', error);
        return null;
      }
    }
  };
})(window.AIC);

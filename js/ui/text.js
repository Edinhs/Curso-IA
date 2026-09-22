/**
 * Copy rendering.
 *
 * Content in `/data` is plain text, never HTML — authors should not be able to
 * break the page (or inject markup) by writing a paragraph. The one piece of
 * formatting they get is [[double brackets]], which becomes an inline
 * highlight. Everything else is escaped.
 */
(function (AIC) {
  'use strict';

  var HIGHLIGHT = /\[\[([^\]]+)\]\]/g;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  AIC.ui.text = {
    escapeHtml: escapeHtml,

    /** Returns an HTML string with [[highlights]] resolved and all else escaped. */
    inline: function (value) {
      return escapeHtml(value).replace(HIGHLIGHT, '<em class="mark">$1</em>');
    },

    /** A <p> per entry, ready to append. */
    paragraphs: function (values, className) {
      return (values || []).map(function (value) {
        return AIC.core.dom.el('p', {
          class: className || 'prose',
          html: AIC.ui.text.inline(value)
        });
      });
    }
  };
})(window.AIC);

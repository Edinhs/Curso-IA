/**
 * Small DOM helpers. Not a framework — just the four or five things we would
 * otherwise retype in every component.
 */
(function (AIC) {
  'use strict';

  function el(tag, options) {
    var node = document.createElement(tag);
    if (!options) return node;

    Object.keys(options).forEach(function (key) {
      var value = options[key];
      if (value === null || value === undefined) return;

      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else if (key === 'children') append(node, value);
      else node.setAttribute(key, value);
    });
    return node;
  }

  function append(parent, children) {
    (Array.isArray(children) ? children : [children]).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return parent;
  }

  /** Inline SVG icon referencing the sprite defined once in index.html. */
  function icon(id, options) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', (options && options.class) || 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('viewBox', '0 0 24 24');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    // `href` works in every evergreen browser; `xlink:href` keeps older ones happy.
    use.setAttribute('href', '#' + id);
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  AIC.core.dom = {
    el: el,
    append: append,
    icon: icon,
    svgEl: svgEl,
    qs: function (selector, scope) { return (scope || document).querySelector(selector); },
    qsa: function (selector, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }
  };
})(window.AIC);

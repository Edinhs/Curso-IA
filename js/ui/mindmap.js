/**
 * The progressive mind map.
 *
 *   AI → Machine Learning → Deep Learning → Transformer → LLM → …
 *
 * The map is declared once in `data/mindmap.js` and revealed piece by piece:
 * a node lights up when a beat that teaches it has been reached. Nodes still
 * ahead stay drawn but faint, so the learner can always see that there is more
 * road — the map is a map, not a score.
 *
 * Layout is derived from the tree. Nodes in declaration order form a vertical
 * trunk; a node flagged `branch` hangs off its parent. Authors never write
 * coordinates.
 *
 * This is the one diagram that earns SVG: it has real geometry, and connectors
 * have to be drawn rather than implied.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var store = AIC.core.store;

  /* Geometry of the drawing, in viewBox units. The viewBox hugs the content so
     the map fills the panel instead of floating in its own margins. */
  var ROW = 62;
  var TRUNK_X = 205;
  var BRANCH_DX = 100;
  var PADDING_TOP = 34;
  var WIDTH = 500;

  function layout(data) {
    var byId = Object.create(null);
    data.nodes.forEach(function (node) { byId[node.id] = node; });

    var placed = [];
    var positions = Object.create(null);
    var row = 0;

    data.nodes.forEach(function (node) {
      if (node.branch) return;
      positions[node.id] = { x: TRUNK_X, y: PADDING_TOP + row * ROW, row: row };
      placed.push(node);
      row += 1;
    });

    data.nodes.forEach(function (node) {
      if (!node.branch) return;
      var parent = positions[node.parent];
      if (!parent) return;
      positions[node.id] = {
        x: TRUNK_X + (node.branch === 'left' ? -BRANCH_DX : BRANCH_DX),
        y: parent.y + ROW * 0.52,
        row: parent.row,
        side: node.branch
      };
      placed.push(node);
    });

    return {
      nodes: placed,
      positions: positions,
      byId: byId,
      height: PADDING_TOP * 2 + Math.max(row - 1, 0) * ROW
    };
  }

  function connectorPath(from, to) {
    if (from.x === to.x) return 'M' + from.x + ' ' + from.y + ' L' + to.x + ' ' + to.y;
    // Elbow: drop from the trunk, then run out to the branch.
    var midY = to.y - 16;
    return 'M' + from.x + ' ' + from.y +
      ' L' + from.x + ' ' + midY +
      ' Q' + from.x + ' ' + to.y + ' ' + (from.x + (to.x - from.x) * 0.24) + ' ' + to.y +
      ' L' + to.x + ' ' + to.y;
  }

  AIC.ui.mindmap = {
    build: function () {
      var data = AIC.data.mindmap;
      var model = layout(data);
      var elements = Object.create(null);

      var svg = dom.svgEl('svg', {
        class: 'mindmap__svg',
        viewBox: '0 0 ' + WIDTH + ' ' + model.height,
        role: 'img',
        'aria-label': 'Mapa mental do curso — conceitos já percorridos e conceitos à frente'
      });

      var linkLayer = dom.svgEl('g', { class: 'mindmap__links' });
      var nodeLayer = dom.svgEl('g', { class: 'mindmap__nodes' });
      svg.appendChild(linkLayer);
      svg.appendChild(nodeLayer);

      model.nodes.forEach(function (node) {
        var position = model.positions[node.id];
        if (!node.parent) return;
        var parent = model.positions[node.parent];
        if (!parent) return;

        var linkEra = AIC.data.getEra(node.era);
        var link = dom.svgEl('path', {
          class: 'mindmap__link',
          'data-node': node.id,
          d: connectorPath(parent, position)
        });
        if (linkEra) link.style.setProperty('--node-accent', linkEra.accent);
        linkLayer.appendChild(link);
        elements[node.id] = elements[node.id] || {};
        elements[node.id].link = link;
      });

      model.nodes.forEach(function (node) {
        var position = model.positions[node.id];
        var era = AIC.data.getEra(node.era);
        var toLeft = position.side === 'left';

        var group = dom.svgEl('g', {
          class: 'mindmap__node',
          'data-node': node.id,
          'data-era': node.era,
          transform: 'translate(' + position.x + ' ' + position.y + ')'
        });
        if (era) group.style.setProperty('--node-accent', era.accent);

        group.appendChild(dom.svgEl('circle', { class: 'mindmap__halo', r: '13' }));
        group.appendChild(dom.svgEl('circle', { class: 'mindmap__ring', r: '6.5' }));
        group.appendChild(dom.svgEl('circle', { class: 'mindmap__core', r: '2.4' }));

        var labelX = toLeft ? -22 : 22;
        var anchor = toLeft ? 'end' : 'start';

        var label = dom.svgEl('text', {
          class: 'mindmap__label', x: labelX, y: '-1', 'text-anchor': anchor
        });
        label.textContent = node.label;
        group.appendChild(label);

        if (node.note) {
          var note = dom.svgEl('text', {
            class: 'mindmap__note', x: labelX, y: '14', 'text-anchor': anchor
          });
          note.textContent = node.note;
          group.appendChild(note);
        }

        nodeLayer.appendChild(group);
        elements[node.id] = elements[node.id] || {};
        elements[node.id].node = group;
      });

      function sync(revealed, added) {
        model.nodes.forEach(function (node) {
          var entry = elements[node.id];
          if (!entry) return;
          var isRevealed = revealed.indexOf(node.id) !== -1;
          var isNew = added && added.indexOf(node.id) !== -1;

          if (entry.node) {
            entry.node.classList.toggle('is-revealed', isRevealed);
            if (isNew) {
              entry.node.classList.add('is-new');
              window.setTimeout(function () { entry.node.classList.remove('is-new'); }, 1400);
            }
          }
          if (entry.link) entry.link.classList.toggle('is-revealed', isRevealed);
        });
      }

      sync(store.state.revealed, null);
      bus.on(events.MINDMAP_GROW, function (payload) { sync(payload.revealed, payload.added); });

      return {
        element: svg,
        sync: sync,
        total: model.nodes.length,

        /** Brings the furthest concept the learner has unlocked into view. */
        focusFrontier: function () {
          var revealed = store.state.revealed;
          var last = revealed[revealed.length - 1];
          var entry = last && elements[last];
          if (!entry || !entry.node) return;
          entry.node.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      };
    }
  };
})(window.AIC);

/**
 * Beat sections.
 *
 * Every screen of the journey is generated from `data/beats.js` — there is no
 * per-beat markup anywhere in index.html.
 *
 * ── The station reads in one order ────────────────────────────────────────
 *   the coordinate arrives alone, at hero scale
 *   it settles into a label as the source and the question surface
 *   the three lines resolve in sequence: discovery, concept, consequence
 *   on departure, the question the station opens is the last thing on screen
 *
 * That last move matters more than it looks: a beat's `nextQuestion` is the
 * next beat's `question`, word for word. The reader watches a question form,
 * scrolls, and arrives at the station that answers it. The handoff is the
 * narrative.
 *
 * ── How it is driven ──────────────────────────────────────────────────────
 * Nothing here is a triggered animation. `js/scroll/choreography.js` writes
 * the five phase values onto the section as custom properties, and the CSS
 * reads them. Every element is a pure function of scroll position, so
 * scrolling backwards plays the arrival in reverse instead of stranding the
 * screen in a state it cannot leave.
 *
 * Staggering is done in CSS from `--si` (stagger index) rather than in JS, so
 * the browser interpolates it on the compositor and the cost per frame is one
 * custom property write per station.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var config = AIC.core.config;

  /** A line of the narrative, with its place in the reveal sequence. */
  function narrativeLine(value, variant, staggerIndex) {
    if (!value) return null;
    return dom.el('p', {
      class: 'line line--' + variant + ' stagger',
      style: '--si:' + staggerIndex,
      html: AIC.ui.text.inline(value)
    });
  }

  function buildSection(beat, index) {
    var chapter = AIC.data.getChapter(beat.chapterId);
    var essential = beat.essential;
    var content = [];

    if (beat.coordinate) {
      // Long coordinates ("1990s", "2012 — 2017") must not outgrow the column.
      var fit = Math.min(1, 4 / Math.max(beat.coordinate.length, 1)).toFixed(3);
      content.push(dom.el('span', {
        class: 'beat__coordinate',
        'aria-hidden': 'true',
        style: '--coordinate-fit:' + Math.max(fit, 0.62),
        text: beat.coordinate
      }));
    }

    content.push(dom.el('p', {
      class: 'beat__meta stagger',
      style: '--si:0',
      children: [
        dom.el('span', { class: 'beat__chapter', text: chapter ? chapter.number : '—' }),
        dom.el('span', { class: 'beat__chapter-title', text: chapter ? chapter.title : '' })
      ]
    }));

    if (beat.source) {
      content.push(dom.el('p', {
        class: 'beat__source stagger',
        style: '--si:1',
        text: beat.source
      }));
    }

    content.push(dom.el('h2', {
      class: 'beat__question stagger',
      style: '--si:2',
      id: 'beat-title-' + beat.id,
      html: AIC.ui.text.inline(beat.question)
    }));

    if (beat.term) {
      content.push(dom.el('p', { class: 'beat__term stagger', style: '--si:3', text: beat.term }));
    }

    var block = dom.el('div', { class: 'essential stagger', style: '--si:4' });
    block.appendChild(dom.el('div', {
      class: 'essential__head',
      children: [
        AIC.ui.markers.create(essential.marker || 'concept'),
        dom.el('span', { class: 'essential__layer', text: 'ESSENTIAL' })
      ]
    }));
    dom.append(block, [
      narrativeLine(essential.discovery, 'discovery', 5),
      narrativeLine(essential.concept, 'concept', 6),
      narrativeLine(essential.connection, 'connection', 7)
    ]);
    content.push(block);

    if (beat.copilot && beat.copilot.surface === 'inline') {
      content.push(dom.el('aside', {
        class: 'copilot-note copilot-note--inline stagger',
        style: '--si:8',
        children: [
          AIC.ui.markers.create('copilot'),
          dom.el('p', { class: 'prose prose--dim', html: AIC.ui.text.inline(beat.copilot.body) })
        ]
      }));
    }

    var deepDive = AIC.ui.deepDive.create(beat);
    if (deepDive) {
      deepDive.toggle.classList.add('stagger');
      deepDive.toggle.style.setProperty('--si', '9');
      content.push(deepDive.toggle);
    }

    // The door this station opens. Appears only as the camera leaves, and is
    // the next station's question verbatim.
    if (beat.nextQuestion) {
      content.push(dom.el('p', {
        class: 'beat__next',
        children: [
          dom.el('span', { class: 'beat__next-mark', 'aria-hidden': 'true' }),
          dom.el('span', { class: 'beat__next-text', text: beat.nextQuestion })
        ]
      }));
    }

    var section = dom.el('section', {
      class: 'beat',
      id: 'beat-' + beat.id,
      'data-station': '',
      'data-beat': beat.id,
      'data-depth': String(beat.depth),
      'data-anchor': '0.5',
      'data-era': beat.era,
      'aria-labelledby': 'beat-title-' + beat.id,
      style: '--beat-height:' + config.scroll.beatHeightVh + 'vh;--beat-index:' + index,
      children: [
        dom.el('div', {
          class: 'beat__stage',
          children: [
            dom.el('div', {
              class: 'beat__inner',
              children: [
                dom.el('div', { class: 'beat__content', children: content }),
                // Second column. Empty until the engineering layer opens —
                // that negative space is where the construct lives.
                dom.el('div', {
                  class: 'beat__aside',
                  children: deepDive ? [deepDive.panel] : []
                })
              ]
            })
          ]
        })
      ]
    });

    if (deepDive) deepDive.setHost(section);
    return section;
  }

  AIC.ui.beats = {
    render: function (container) {
      return AIC.data.beats.map(function (beat, index) {
        var section = buildSection(beat, index);
        container.appendChild(section);
        return section;
      });
    },

    /**
     * How far the coordinate travels between its hero position and its slot.
     *
     * Measured rather than guessed: the copy column is a different height on
     * every station, so a fixed `em` or `vh` offset lands the hero coordinate
     * somewhere slightly different each time. One layout read per station per
     * resize buys an arrival that is centred on all of them.
     */
    measure: function (sections) {
      sections.forEach(function (section) {
        var coordinate = dom.qs('.beat__coordinate', section);
        var stage = dom.qs('.beat__stage', section);
        if (!coordinate || !stage) return;

        // Read the settled position with the hero transform neutralised.
        section.style.setProperty('--hero-travel', '0px');
        var box = coordinate.getBoundingClientRect();
        var frame = stage.getBoundingClientRect();
        var travel = (frame.top + frame.height * 0.5) - (box.top + box.height * 0.5);
        section.style.setProperty('--hero-travel', Math.max(travel, 0).toFixed(1) + 'px');
      });
    },

    bind: function (sections) {
      var bindings = sections.map(function (section) {
        return AIC.scroll.choreography.bind(section, section.dataset.beat);
      });

      AIC.ui.beats.measure(sections);
      window.addEventListener('resize', AIC.core.utils.debounce(function () {
        AIC.ui.beats.measure(sections);
      }, 160), { passive: true });

      // Switching to reduced motion mid-journey must not leave a half-played
      // station on screen: settle every one of them into its EXPLORE state.
      AIC.core.bus.on(AIC.core.events.MOTION_CHANGE, function (payload) {
        if (!payload.reduced) return;
        bindings.forEach(function (binding) { binding.apply(0.6); });
      });
    }
  };
})(window.AIC);

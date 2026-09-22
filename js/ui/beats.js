/**
 * Beat sections.
 *
 * Every screen of the journey is generated from `data/beats.js` — there is no
 * per-beat markup anywhere in index.html. Adding a beat to the array adds a
 * station to the timeline, a marker to the 3D corridor, a segment to the
 * progress rail and a step to the mind map, with no other edit.
 *
 * Layout: the section is tall, the stage inside it is `position: sticky`, so
 * the copy holds still while the camera travels. Opacity and drift are scrubbed
 * against the section's own scroll progress — text arrives, is held perfectly
 * still and legible for the middle half of the section, then leaves.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var config = AIC.core.config;
  var utils = AIC.core.utils;

  function buildSection(beat, index) {
    var chapter = AIC.data.getChapter(beat.chapterId);
    var content = [];

    if (beat.year) {
      content.push(dom.el('span', { class: 'beat__year', 'aria-hidden': 'true', text: beat.year }));
    }

    content.push(dom.el('p', {
      class: 'beat__chapter',
      children: [
        dom.el('span', { class: 'beat__chapter-number', text: chapter ? chapter.number : '—' }),
        dom.el('span', { class: 'beat__chapter-title', text: chapter ? chapter.title : '' })
      ]
    }));

    content.push(dom.el('p', { class: 'beat__eyebrow', text: beat.eyebrow }));
    content.push(dom.el('h2', { class: 'beat__title', html: AIC.ui.text.inline(beat.title) }));
    content.push(dom.el('p', { class: 'beat__lead', html: AIC.ui.text.inline(beat.lead) }));

    var essential = dom.el('div', { class: 'essential' });
    essential.appendChild(dom.el('div', {
      class: 'essential__head',
      children: [
        AIC.ui.markers.create(beat.essential.marker || 'concept'),
        dom.el('span', { class: 'essential__layer', text: 'ESSENTIAL' })
      ]
    }));
    dom.append(essential, AIC.ui.text.paragraphs(beat.essential.body));
    content.push(essential);

    if (beat.copilot && beat.copilot.surface === 'inline') {
      content.push(dom.el('aside', {
        class: 'copilot-note copilot-note--inline',
        children: [
          AIC.ui.markers.create('copilot'),
          dom.el('p', { class: 'prose prose--dim', html: AIC.ui.text.inline(beat.copilot.body) })
        ]
      }));
    }

    var deepDive = AIC.ui.deepDive.create(beat);
    if (deepDive) content.push(deepDive.toggle);

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
                // Second column. Empty until the engineering layer is opened —
                // that negative space is where the corridor shows through.
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

    dom.qs('.beat__title', section).id = 'beat-title-' + beat.id;
    if (deepDive) deepDive.setHost(section);
    return section;
  }

  /** Scrubs copy opacity/drift against the section's own progress. */
  function bindScrub(section) {
    var inner = dom.qs('.beat__inner', section);
    var fadeIn = config.scroll.copyIn;
    var fadeOut = config.scroll.copyOut;

    function apply(progress) {
      var appear = utils.smoothstep(0, fadeIn, progress);
      var disappear = 1 - utils.smoothstep(fadeOut, 1, progress);
      var opacity = appear * disappear;
      inner.style.setProperty('--copy-opacity', opacity.toFixed(3));
      inner.style.setProperty('--copy-shift', ((1 - appear) * 34 - (1 - disappear) * 24).toFixed(2) + 'px');
    }

    if (AIC.core.motion.reduced) {
      inner.style.setProperty('--copy-opacity', '1');
      inner.style.setProperty('--copy-shift', '0px');
      return;
    }

    if (AIC.core.capabilities.scrollTrigger) {
      // Hidden until the stage pins. Without this the copy is fully lit while
      // it is still sliding up from below, which reads as an ordinary web page.
      apply(0);
      window.ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: function (self) { apply(self.progress); },
        onLeave: function () { apply(1); },
        onLeaveBack: function () { apply(0); }
      });
    } else {
      // No GSAP: the copy still appears, driven by visibility instead of scrub.
      var observer = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { apply(entry.isIntersecting ? 0.5 : 0); });
      }, { rootMargin: '-25% 0px -25% 0px' });
      observer.observe(section);
    }
  }

  AIC.ui.beats = {
    render: function (container) {
      var sections = AIC.data.beats.map(function (beat, index) {
        var section = buildSection(beat, index);
        container.appendChild(section);
        return section;
      });
      return sections;
    },

    bind: function (sections) {
      sections.forEach(bindScrub);

      AIC.core.bus.on(AIC.core.events.MOTION_CHANGE, function (payload) {
        if (!payload.reduced) return;
        sections.forEach(function (section) {
          var inner = dom.qs('.beat__inner', section);
          inner.style.setProperty('--copy-opacity', '1');
          inner.style.setProperty('--copy-shift', '0px');
        });
      });
    }
  };
})(window.AIC);

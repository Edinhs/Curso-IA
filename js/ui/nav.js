/**
 * Chrome: the top bar, the two overlays, the advance control and the keyboard.
 *
 * Everything here is deliberately quiet. The bar is a hairline and three words;
 * the advance control only appears once the journey has started; the mind-map
 * button carries a counter that ticks up as concepts unlock, which is the only
 * moment any of this chrome asks for attention.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var bus = AIC.core.bus;
  var events = AIC.core.events;
  var store = AIC.core.store;

  var EDITABLE = /^(input|textarea|select)$/i;

  function isTyping(target) {
    return !!target && (EDITABLE.test(target.tagName) || target.isContentEditable);
  }

  AIC.ui.nav = {
    mount: function (root, journey) {
      var map = AIC.ui.mindmap.build();

      var mapOverlay = AIC.ui.overlay.create({
        id: 'overlay-map',
        eyebrow: 'mapa mental progressivo',
        title: 'O que você já percorreu'
      });
      mapOverlay.body.appendChild(dom.el('div', { class: 'mindmap', children: [map.element] }));
      mapOverlay.body.appendChild(dom.el('p', {
        class: 'overlay__footnote',
        text: 'Os conceitos acendem conforme a jornada avança. Os apagados ainda estão à frente.'
      }));

      var indexOverlay = AIC.ui.overlay.create({
        id: 'overlay-index',
        eyebrow: 'estrutura do curso',
        title: 'Doze capítulos'
      });
      var indexList = dom.el('ol', { class: 'chapter-list chapter-list--compact' });
      AIC.data.chapters.forEach(function (chapter) {
        var beat = AIC.data.beats.filter(function (b) { return b.chapterId === chapter.id; })[0];
        var era = AIC.data.getEra(chapter.era);
        var content = [
          dom.el('span', { class: 'chapter-row__number', text: chapter.number }),
          dom.el('span', {
            class: 'chapter-row__text',
            children: [
              dom.el('span', { class: 'chapter-row__title', text: chapter.title }),
              dom.el('span', { class: 'chapter-row__summary', text: chapter.summary })
            ]
          }),
          dom.el('span', { class: 'chapter-row__era', text: era ? era.label : '' })
        ];

        var row = dom.el('li', {
          class: 'chapter-row',
          'data-era': chapter.era,
          style: era ? '--row-accent:' + era.accent : null
        });
        if (beat) {
          row.classList.add('chapter-row--available');
          var link = dom.el('button', { type: 'button', class: 'chapter-row__link', children: content });
          link.addEventListener('click', function () {
            indexOverlay.close();
            journey.goTo(beat.id);
          });
          row.appendChild(link);
        } else {
          row.appendChild(dom.el('div', { class: 'chapter-row__link', children: content }));
        }
        indexList.appendChild(row);
      });
      indexOverlay.body.appendChild(indexList);

      // Vocabulary. Same overlay, because this is the reference panel: the
      // terms the journey is heading towards, each labelled with the chapter
      // that will define it properly.
      var glossary = dom.el('dl', { class: 'glossary' });
      AIC.data.glossary.forEach(function (entry) {
        var chapter = AIC.data.getChapter(entry.chapterId);
        glossary.appendChild(dom.el('div', {
          class: 'glossary__row',
          children: [
            dom.el('dt', {
              class: 'glossary__term',
              children: [
                dom.el('span', { text: entry.term }),
                dom.el('span', { class: 'glossary__chapter', text: chapter ? chapter.number : '' })
              ]
            }),
            dom.el('dd', { class: 'glossary__definition', text: entry.short })
          ]
        }));
      });

      indexOverlay.body.appendChild(dom.el('section', {
        class: 'overlay__section',
        children: [
          dom.el('h3', { class: 'overlay__section-title', text: 'Vocabulário à frente' }),
          glossary
        ]
      }));

      var mapCount = dom.el('span', { class: 'topbar__count', text: '0/' + map.total });
      var mapButton = dom.el('button', {
        type: 'button',
        class: 'topbar__action',
        'aria-haspopup': 'dialog',
        children: [dom.icon('map'), dom.el('span', { text: 'Mapa' }), mapCount]
      });
      mapButton.addEventListener('click', function () {
        mapOverlay.toggle();
        if (mapOverlay.isOpen) map.focusFrontier();
      });

      var indexButton = dom.el('button', {
        type: 'button',
        class: 'topbar__action',
        'aria-haspopup': 'dialog',
        children: [dom.icon('index'), dom.el('span', { text: 'Capítulos' })]
      });
      indexButton.addEventListener('click', indexOverlay.toggle);

      var motionButton = dom.el('button', {
        type: 'button',
        class: 'topbar__action topbar__action--icon',
        'aria-pressed': String(AIC.core.motion.reduced),
        title: 'Reduzir movimento',
        'aria-label': 'Reduzir movimento',
        children: [dom.icon('motion')]
      });
      motionButton.addEventListener('click', function () {
        var reduced = AIC.core.motion.toggle();
        motionButton.setAttribute('aria-pressed', String(reduced));
      });

      var progressLine = dom.el('span', { class: 'topbar__progress', 'aria-hidden': 'true' });

      var topbar = dom.el('header', {
        class: 'topbar',
        children: [
          dom.el('p', {
            class: 'topbar__brand',
            children: [
              dom.el('span', { class: 'topbar__client', text: 'Stellantis' }),
              dom.el('span', { class: 'topbar__course', text: 'Fundamentos de Inteligência Artificial' })
            ]
          }),
          dom.el('nav', {
            class: 'topbar__actions',
            'aria-label': 'Navegação do curso',
            children: [indexButton, mapButton, motionButton]
          }),
          progressLine
        ]
      });

      var advance = dom.el('button', {
        type: 'button',
        class: 'advance',
        'aria-label': 'Avançar para o próximo momento',
        children: [
          dom.el('span', { class: 'advance__label', text: 'avançar' }),
          dom.icon('arrow-down', { class: 'advance__icon' })
        ]
      });
      advance.addEventListener('click', function () { journey.next(); });

      root.appendChild(topbar);
      root.appendChild(mapOverlay.element);
      root.appendChild(indexOverlay.element);
      root.appendChild(advance);

      bus.on(events.MINDMAP_GROW, function (payload) {
        mapCount.textContent = payload.revealed.length + '/' + map.total;
        mapButton.classList.add('is-pulsing');
        window.setTimeout(function () { mapButton.classList.remove('is-pulsing'); }, 1600);
      });

      bus.on(events.JOURNEY_PROGRESS, function (payload) {
        topbar.style.setProperty('--doc-progress', payload.documentProgress.toFixed(4));
        document.documentElement.classList.toggle('is-journeying', payload.scrollY > window.innerHeight * 0.4);
        advance.hidden = payload.documentProgress > 0.985;
      });

      document.addEventListener('keydown', function (event) {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
        if (isTyping(event.target)) return;

        switch (event.key) {
          case 'n':
          case 'N':
            journey.next();
            break;
          case 'p':
          case 'P':
            journey.previous();
            break;
          case 'm':
          case 'M':
            mapOverlay.toggle();
            if (mapOverlay.isOpen) map.focusFrontier();
            break;
          case 'i':
          case 'I':
            indexOverlay.toggle();
            break;
          case 'Escape':
            AIC.ui.overlay.closeAll();
            break;
          default:
            return;
        }
        event.preventDefault();
      });

      // Anchor links from the outro should glide rather than teleport.
      root.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('[data-goto]');
        if (!link) return;
        event.preventDefault();
        journey.goTo(link.dataset.goto);
      });

      return { mapOverlay: mapOverlay, indexOverlay: indexOverlay, mindmap: map };
    }
  };
})(window.AIC);

/**
 * The closing station: where the slice stops and the course continues.
 *
 * The twelve chapters are rendered straight from `data/chapters.js` as a single
 * editorial list — hairlines and large numerals, not a grid of cards. Chapters
 * that already have authored beats become links into the timeline; the rest are
 * listed as reserved, which is an honest statement of where the project is.
 */
(function (AIC) {
  'use strict';

  var dom = AIC.core.dom;
  var config = AIC.core.config;

  function firstBeatOf(chapterId) {
    return AIC.data.beats.filter(function (beat) { return beat.chapterId === chapterId; })[0] || null;
  }

  function chapterRow(chapter) {
    var era = AIC.data.getEra(chapter.era);
    var beat = firstBeatOf(chapter.id);
    var isPreview = chapter.status === 'preview' && beat;

    var body = [
      dom.el('span', { class: 'chapter-row__number', text: chapter.number }),
      dom.el('span', {
        class: 'chapter-row__text',
        children: [
          dom.el('span', { class: 'chapter-row__title', text: chapter.title }),
          dom.el('span', { class: 'chapter-row__summary', text: chapter.summary })
        ]
      }),
      dom.el('span', { class: 'chapter-row__era', text: era ? era.label : '' }),
      dom.el('span', {
        class: 'chapter-row__status',
        text: isPreview ? 'nesta demonstração' : 'conteúdo a definir'
      })
    ];

    if (isPreview) {
      return dom.el('li', {
        class: 'chapter-row chapter-row--available',
        'data-era': chapter.era,
        style: era ? '--row-accent:' + era.accent : null,
        children: [dom.el('a', {
          class: 'chapter-row__link',
          href: '#beat-' + beat.id,
          'data-goto': beat.id,
          children: body
        })]
      });
    }

    return dom.el('li', {
      class: 'chapter-row',
      'data-era': chapter.era,
      style: era ? '--row-accent:' + era.accent : null,
      children: [dom.el('div', { class: 'chapter-row__link', children: body })]
    });
  }

  AIC.ui.chapters = {
    buildOutro: function () {
      var list = dom.el('ol', { class: 'chapter-list' });
      AIC.data.chapters.forEach(function (chapter) { list.appendChild(chapterRow(chapter)); });

      var labs = dom.el('p', {
        class: 'outro__labs',
        text: 'Módulos interativos previstos: ' + AIC.data.chapters
          .reduce(function (all, chapter) { return all.concat(chapter.labs); }, [])
          .join(' · ')
      });

      return dom.el('section', {
        class: 'outro',
        id: 'outro',
        'data-station': '',
        'data-depth': '1',
        'data-anchor': '0.35',
        'data-era': 'agents',
        'aria-labelledby': 'outro-title',
        style: '--outro-height:' + config.scroll.outroHeightVh + 'vh',
        children: [
          dom.el('div', {
            class: 'outro__stage',
            children: [
              dom.el('header', {
                class: 'outro__head',
                children: [
                  dom.el('p', { class: 'outro__eyebrow', text: 'fim da demonstração · a jornada continua' }),
                  dom.el('h2', { class: 'outro__title', id: 'outro-title', text: 'Doze capítulos à frente' }),
                  dom.el('p', {
                    class: 'outro__lead',
                    html: AIC.ui.text.inline(
                      'Esta versão percorre quatro momentos para validar a experiência. A estrutura abaixo já existe em ' +
                      '[[data/chapters.js]] — cada capítulo entra no percurso adicionando suas cenas, sem reconstruir a aplicação.'
                    )
                  })
                ]
              }),
              list,
              labs
            ]
          })
        ]
      });
    }
  };
})(window.AIC);

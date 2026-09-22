# Fundamentos de Inteligência Artificial — jornada interativa

Experiência educacional interativa sobre a história e os fundamentos da
Inteligência Artificial, para engenheiros da Stellantis, com atenção ao
contexto de Infotainment e ao uso corporativo do Microsoft 365 Copilot.

A navegação principal é o **scroll**: rolar a página avança a câmera por um
corredor tridimensional em que **profundidade é tempo**.

> **Estado atual: fundação técnica e visual.**
> Esta versão implementa a arquitetura completa e uma *vertical slice* com
> quatro momentos da linha do tempo (1950 Turing · 1956 Dartmouth · Machine
> Learning · 2017 Transformer). O conteúdo das doze aulas entra depois,
> em `/data`, sem reconstruir a aplicação.

---

## Como executar

**Basta abrir `index.html` no navegador.** Dois cliques, sem servidor, sem
instalação, sem rede.

O projeto foi construído deliberadamente sem ES modules e sem `fetch`, que são
as duas coisas que quebram sob o protocolo `file://`. Tudo — bibliotecas,
fontes, ícones, dados — é carregado por caminho relativo a partir da própria
pasta.

Se você preferir servir por HTTP (útil para inspecionar cache, ou para publicar
em uma intranet), qualquer servidor estático funciona:

```bash
python3 -m http.server 8000     # depois abra http://localhost:8000
```

Nenhuma funcionalidade depende disso. **Não existe passo de build.**

Navegadores suportados: Chrome, Edge e Firefox atuais. O Edge é o alvo
principal, por ser o padrão em notebooks corporativos.

### Atalhos de teclado

| Tecla | Ação |
| --- | --- |
| `N` / `P` | avançar / voltar um momento da linha do tempo |
| `M` | abrir o mapa mental |
| `I` | abrir o índice de capítulos |
| `Esc` | fechar sobreposições |
| `Tab` | percorrer os controles (foco sempre visível) |

O scroll da roda, do trackpad e da barra de rolagem funcionam normalmente —
nada é sequestrado.

---

## Arquitetura

```
index.html            documento único; declara a ordem de carga e o sprite de ícones
/css
  tokens.css          variáveis de design (cor, tipo, espaço, movimento, camadas)
  reset.css           reset mínimo
  typography.css      @font-face locais e a voz tipográfica
  layout.css          o shell e os três tipos de estação (abertura, beat, fecho)
  components.css      marcadores, deep dive, trilho, sobreposições, mapa mental
  responsive.css      notebook → Full HD → tablet → celular, e impressão
/data                 CONTEÚDO — a única pasta que um autor de curso precisa tocar
  eras.js             as seis fases da jornada (rótulo, cor, faixa na linha do tempo)
  chapters.js         os doze capítulos (metadados)
  beats.js            as cenas narradas (o conteúdo propriamente dito)
  mindmap.js          os nós do mapa mental progressivo
  glossary.js         termos, reservado para a interação de glossário
/js
  /core               fundação sem opinião sobre o curso
    namespace.js      o objeto global AIC
    config.js         TODA a configuração numérica do projeto
    bus.js            publish/subscribe + os nomes dos eventos
    dom.js            auxiliares de DOM e SVG
    utils.js          lerp, clamp, smoothstep, damp, random determinístico
    capabilities.js   detecção de WebGL, GSAP, ponteiro, viewport
    motion.js         política de movimento (prefers-reduced-motion + override)
    registry.js       ponto de extensão dos módulos interativos
    store.js          estado da jornada (beat atual, era, conceitos revelados)
  /scene              o corredor 3D
    path.js           a curva que câmera e corredor compartilham
    renderer.js       contexto WebGL, resize, laço de animação, pausa
    /layers
      dust.js         partículas (um draw call, deslocamento no shader)
      corridor.js     os trilhos e as graduações — o eixo do tempo
      nodes.js        os anéis que marcam cada momento
    stage.js          compõe as camadas e traduz scroll em movimento de câmera
    fallback.js       equivalente em Canvas 2D quando não há WebGL
  /scroll
    journey.js        scroll → tempo (o coração da experiência)
  /ui                 componentes; todos recebem dados, nenhum recebe markup
    text.js           renderização de texto com destaque [[assim]]
    animate.js        as poucas animações compartilhadas
    markers.js        CONCEPT / ENGINEERING / COPILOT
    flow.js           diagramas de fluxo
    deepdive.js       ESSENTIAL / ENGINEERING DEEP DIVE
    beats.js          gera as seções a partir de data/beats.js
    intro.js          a abertura
    chapters.js       o índice de capítulos e o fecho
    overlay.js        painel sobreposto genérico
    mindmap.js        o mapa mental progressivo
    progress.js       o trilho de progresso
    nav.js            barra superior, sobreposições, teclado
  app.js              bootstrap
/vendor               bibliotecas, versionadas junto com o projeto
/assets/fonts         Inter Variable e IBM Plex Mono, locais
/tools                scripts de manutenção (não necessários para executar)
```

### Decisões que valem explicação

**Scripts clássicos em vez de ES modules.** A restrição de funcionar a partir de
`file://` é incompatível com `<script type="module">`: o navegador bloqueia
módulos por CORS nesse protocolo. Cada arquivo é uma IIFE que se anexa ao objeto
`window.AIC`, e a ordem de carga é declarada uma única vez, no `index.html`.
Foi o custo de admissão para a entrega funcionar sem servidor.

**Dados em `.js` e não em `.json`.** Pela mesma razão: `fetch('data.json')`
falha sob `file://`. Os arquivos em `/data` são objetos literais — a mesma
estrutura de um JSON, sem a chamada de rede. Migrar para JSON de verdade, caso
o curso passe a ser servido por HTTP, é trocar o corpo de cada arquivo por um
`fetch`; nada mais no código precisa mudar.

**Three.js compilado em um bundle próprio.** O Three.js só distribui ES
modules. `tools/vendor.mjs` gera `vendor/three/three.slim.js`, um bundle IIFE
com apenas as classes listadas em `tools/three.entry.js`, que expõe um global
`THREE`. O arquivo está versionado no repositório — **não há passo de build para
executar o projeto.**

**Ícones inline.** O sprite SVG vive no `index.html` e é referenciado por
`<use href="#id">`. Arquivos `.svg` separados gerariam requisições que o
`file://` trata de forma inconsistente entre navegadores.

**Diagramas: DOM para fluxos, SVG para o mapa.** Um fluxo (`Text → Tokenizer →
Token IDs → …`) é uma lista de rótulos sem geometria real: renderizado como
`<ol>` com uma espinha em CSS, ele permanece selecionável, legível por leitor de
tela e reflui no celular. O mapa mental tem geometria de verdade — conectores
que precisam ser desenhados — e por isso é SVG.

---

## Como funciona a linha do tempo

O documento é uma pilha de **estações**: a abertura, cada beat, e o fecho.
Cada estação declara no DOM onde fica na linha do tempo:

```html
<section data-station data-depth="0.56" data-anchor="0.5" data-beat="machine-learning" data-era="learning">
```

- `data-depth` — posição na linha do tempo, de `0` a `1`
- `data-anchor` — em que ponto do próprio scroll a estação conta como "chegada"
- `data-era` — qual das seis eras colore a cena

`js/scroll/journey.js` mede a posição absoluta de cada âncora (uma vez, e de
novo a cada resize — nunca a cada frame) e interpola a posição de scroll entre
âncoras consecutivas. Duas consequências:

1. **Os beats não precisam ser igualmente espaçados no tempo.** De 1950 a 1956
   vão seis anos; de 1956 ao Machine Learning, quarenta. A câmera percorre a
   distância; o leitor percorre uma tela em ambos os casos.
2. **A interpolação é suavizada, não linear.** A câmera quase para enquanto um
   beat está centralizado e acelera no vão entre beats. É isso que faz o scroll
   parecer uma viagem, e não o arrasto de um controle deslizante.

O resultado é publicado no barramento como `journey:progress`. Quem se interessa,
escuta: o palco 3D move a câmera, o trilho move o cursor, a barra superior
atualiza a linha de progresso. Adicionar um novo componente que reage ao tempo
é escrever um `bus.on`, não editar o motor de scroll.

No palco 3D (`js/scene/stage.js`) a câmera **persegue** essa posição com
amortecimento, em vez de saltar para ela: isso remove a trepidação do trackpad
sem introduzir atraso perceptível. Ela olha ligeiramente à frente na curva, o
que transforma as curvas em inclinação suave, e a amplitude do desvio é
propositalmente pequena — legibilidade acima de efeito.

---

## Como adicionar um capítulo

Todo o conteúdo vive em `/data`. Nenhum arquivo em `/js` precisa ser tocado.

**1. Registre o capítulo** em `data/chapters.js`:

```js
{
  id: 'ch04', number: '04', era: 'language', status: 'preview',
  title: 'Tokens',
  summary: 'A unidade mínima que o modelo realmente enxerga.',
  labs: ['tokenizer-lab']
}
```

**2. Escreva as cenas** em `data/beats.js`, em ordem crescente de `depth`:

```js
{
  id: 'tokens-basics',
  chapterId: 'ch04',
  era: 'language',
  depth: 0.88,                    // posição na linha do tempo, 0..1
  year: null,                     // opcional; renderizado como numeral gigante
  eyebrow: 'Como o modelo lê',
  title: 'O texto vira número antes de virar significado',
  lead: 'Uma frase que precisa sobreviver sozinha.',

  essential: {                    // camada ESSENTIAL — sempre visível
    marker: 'concept',
    body: [
      'Parágrafo com uma expressão em [[destaque]].',
      'Outro parágrafo.'
    ]
  },

  deepDive: {                     // camada ENGINEERING — atrás do botão
    title: 'O que acontece de verdade',
    intro: 'Uma frase de contexto.',
    flow: [
      { label: 'Text', note: 'a frase que você escreve' },
      { label: 'Tokenizer', note: 'quebra em unidades' }
    ],
    notes: ['Observação técnica.']
  },

  copilot: {                      // camada COPILOT
    surface: 'inline',            // 'inline' ao lado da copy, 'deepdive' dentro do painel
    title: 'No dia a dia',
    body: 'Aplicação prática no Microsoft 365 Copilot.',
    example: null
  },

  mindmap: ['tokens'],            // nós liberados ao chegar aqui
  lab: 'tokenizer-lab'            // módulo interativo, se houver
}
```

**3. Se o capítulo introduz um conceito novo**, adicione o nó em
`data/mindmap.js`, apontando para o pai. O layout é calculado a partir da
árvore — ninguém posiciona nada à mão.

Recarregue a página. A estação existe, o marcador aparece no corredor 3D, o
trilho de progresso se ajusta e o mapa mental cresce.

### Sobre o texto

Conteúdo em `/data` é **texto puro, nunca HTML**. A única formatação disponível
é `[[colchetes duplos]]`, que vira um destaque inline. Todo o resto é escapado,
então nenhum autor consegue quebrar a página — ou injetar markup — escrevendo um
parágrafo.

---

## Onde entram os módulos interativos

O roadmap prevê Tokenizer Lab, Embedding Space 3D, Attention Simulator, Context
Window Meter, Next Token Game, RAG Simulator, Prompt Builder, Hallucination
Challenge, Copilot Architecture Explorer, Agent Simulator, quizzes e exercícios.

O ponto de extensão é `js/core/registry.js`. Um módulo é uma função que recebe o
elemento onde montar e o contexto do beat:

```js
// js/labs/tokenizer-lab.js — acrescente o <script defer> no index.html
(function (AIC) {
  AIC.core.registry.define('tokenizer-lab', function (mount, context) {
    mount.appendChild(/* ... */);
    return { destroy: function () { /* opcional */ } };
  });
})(window.AIC);
```

Referencie o módulo pelo id no beat (`lab: 'tokenizer-lab'`). Três coisas
acontecem sozinhas:

- **Montagem tardia.** Nada do módulo executa até o leitor abrir o deep dive.
- **Placeholder honesto.** Enquanto o módulo não existir, o beat renderiza um
  espaço rotulado com o id — dá para escrever o conteúdo antes de escrever o
  código.
- **Isolamento.** Um módulo que lança exceção é registrado no console e não
  derruba a jornada.

Módulos que precisem de 3D podem criar o próprio contexto, ou reaproveitar
`AIC.scene.createRenderer`. Módulos que precisem reagir ao tempo escutam o
barramento (`AIC.core.bus`).

---

## Bibliotecas

Tudo abaixo está **dentro do repositório**. Nada vem de CDN.
Detalhes e licenças em [`vendor/NOTICE.md`](vendor/NOTICE.md).

| Biblioteca | Papel | Licença |
| --- | --- | --- |
| three.js | o corredor 3D | MIT |
| GSAP + ScrollTrigger | abertura, scrub da copy, transições de painel | GreenSock standard "no charge" |
| Inter Variable | tipografia de texto e display | SIL OFL 1.1 |
| IBM Plex Mono | rótulos, anos, legendas técnicas | SIL OFL 1.1 |

Nenhum framework de interface. A camada de UI são funções que devolvem
elementos DOM, o que, para uma experiência gerada a partir de um array de
dados, é menos código do que a configuração de qualquer framework.

### Atualizar as dependências

```bash
npm install --no-save three gsap esbuild @fontsource-variable/inter @fontsource/ibm-plex-mono
node tools/vendor.mjs
```

O script regenera `/vendor` e `/assets/fonts` e reescreve o `NOTICE.md` com as
versões novas. O resultado é versionado — quem só quer executar o curso nunca
precisa rodar isso.

---

## Como manter o funcionamento offline

Quatro regras. Quebrar qualquer uma delas quebra o requisito central do projeto.

1. **Nenhuma URL absoluta** para `http://` ou `https://` em HTML, CSS ou JS.
   Tudo por caminho relativo.
2. **Nenhum `fetch`, `XMLHttpRequest`, `import()` dinâmico ou WebSocket.**
   Conteúdo novo entra como arquivo em `/data` e um `<script defer>` no
   `index.html`.
3. **Nenhuma fonte, ícone, imagem, vídeo ou embed remoto.** Fontes em
   `assets/fonts`; ícones no sprite do `index.html`; mídia futura em `/assets`.
4. **Nenhuma dependência nova sem passar pelo `tools/vendor.mjs`** e ser
   versionada em `/vendor`.

Para verificar: abra as DevTools na aba Network, recarregue e confirme que toda
requisição é `file://` (ou `data:`). Um teste mais direto: desconecte a rede e
abra o `index.html`.

---

## Desempenho

Alvo: notebook corporativo comum, sem GPU dedicada.

- Partículas limitadas por orçamento (`config.dust`), reduzido automaticamente
  em telas pequenas. O deslocamento acontece no shader — um único draw call,
  nenhuma atualização de buffer por frame.
- `devicePixelRatio` limitado a 1.6 (1.3 em telas compactas). Retina inteira
  triplica a carga de fragmentos sem ganho perceptível neste material.
- Um único `requestAnimationFrame` para toda a cena.
- A renderização **para por completo** quando a aba fica oculta.
- Em `prefers-reduced-motion` o laço nunca inicia: a cena desenha um quadro por
  atualização de scroll e permanece imóvel no resto do tempo.
- Âncoras de scroll são medidas no load e no resize, nunca por frame. O resize
  é debounced, e o `resize` do renderer é chamado uma única vez por evento.
- Perda de contexto WebGL é tratada: a cena para, o CSS reage, e a cena volta se
  o contexto for restaurado.
- Os módulos interativos montam sob demanda, ao abrir o deep dive.

Geometria do corredor: quatro trilhos e as graduações em um único `LineSegments`;
um anel por beat, cada um com sua cor e opacidade. *Instancing* seria mais caro
em complexidade do que economiza aqui — o número de anéis é o número de beats do
curso, dezenas, não milhares.

---

## Acessibilidade

- HTML semântico: `main`, `section`, `h1`/`h2`/`h3`, listas ordenadas para os
  fluxos e para os capítulos.
- Todo controle é um `<button>` ou `<a>` real. Nenhuma `div` clicável.
- O deep dive usa `aria-expanded` + `aria-controls`, e o painel sai da ordem de
  tabulação quando fechado.
- As sobreposições são `role="dialog"` + `aria-modal`, com foco preso dentro,
  `Esc` para fechar e devolução do foco a quem as abriu.
- Mudanças de era são anunciadas por uma região `aria-live` discreta — o cursor
  deslizando por uma linha não comunica nada a um leitor de tela.
- Anel de foco visível em todos os controles; link "pular para o conteúdo".
- `prefers-reduced-motion` é respeitado de verdade, e o leitor pode sobrepor a
  preferência do sistema pelo botão de movimento na barra superior (a escolha é
  lembrada).
- Todo o texto é selecionável e real — nada de texto dentro de canvas.
- Contraste do corpo de texto acima de 7:1; o fundo 3D é escurecido por uma
  vinheta sob a coluna de leitura, e o painel do deep dive atenua a cena
  enquanto está aberto.
- O `@media print` achata a jornada em um documento legível.

---

## Limitações conhecidas

- **A página exige JavaScript.** A interface inteira é gerada a partir de
  `/data`; sem JS, o `<noscript>` explica a situação. É a contrapartida direta
  da arquitetura dirigida por dados — e a alternativa (markup duplicado a cada
  beat) anularia o objetivo de adicionar capítulos sem reconstruir a aplicação.
- **`data/*.js` não é JSON.** Ver "Decisões que valem explicação" acima.
- **Um deep dive longo rola dentro do próprio painel** quando não cabe na tela.
  Há um esmaecimento na base indicando que há mais conteúdo. Com os módulos
  interativos isso será a regra, não a exceção.
- **Em telas estreitas** o deep dive abre abaixo da copy e a estação passa a
  rolar internamente; a rolagem encadeia normalmente para a página ao chegar ao
  fim.
- **Sem áudio.** A configuração já reserva o espaço (`config.audio`), mas nada
  carrega hoje, por decisão desta etapa.
- **Sem deep link por URL.** Recarregar preserva a posição de scroll (e a
  abertura não toca novamente), mas ainda não há `#capitulo-04` navegável.
  O `journey.goTo(id)` já existe; falta só ligá-lo ao `hashchange`.
- **O texto é provisório.** Os quatro momentos existem para validar ritmo
  narrativo e arquitetura, não como roteiro final.

---

## Estrutura de qualidade desta etapa

O que foi verificado antes da entrega: ausência de erros de console em todos os
modos (desktop, movimento reduzido, sem WebGL, celular, 1366×768), ausência de
qualquer requisição externa, funcionamento a partir de `file://`, ausência de
rolagem horizontal no celular, navegação por teclado, foco e retorno de foco nas
sobreposições, e o comportamento de scroll em todas as estações.

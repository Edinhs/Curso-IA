# Fundamentos de Inteligência Artificial — jornada interativa

Experiência educacional interativa sobre a história e os fundamentos da
Inteligência Artificial, para engenheiros da Stellantis, com atenção ao
contexto de Infotainment e ao uso corporativo do Microsoft 365 Copilot.

A navegação principal é o **scroll**: rolar a página avança a câmera por um
corredor tridimensional em que **profundidade é tempo**.

> **Estado atual: fundação técnica, visual e narrativa.**
> Esta versão implementa a arquitetura completa, o sistema visual e uma
> *vertical slice* com quatro momentos da linha do tempo (1950 Turing ·
> 1956 Dartmouth · Machine Learning · 2017 Transformer). O conteúdo das doze
> aulas entra depois, em `/data`, sem reconstruir a aplicação.

A timeline não é uma linha desenhada na página. É um **espaço**: datas são
coordenadas, conceitos são estruturas tridimensionais, e a câmera atravessa a
história. O usuário não lê a linha do tempo — ele viaja por dentro dela.

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

### Modo de desenvolvimento

```
index.html?debug=true
```

Mostra um readout com FPS, progresso da jornada, estação ativa, fase da
coreografia, posição da câmera, era e número de draw calls. Sem o parâmetro o
módulo não registra listener, não cria DOM e não inicia laço — ele não existe
para o leitor.

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
index.html            documento único; ordem de carga e sprite de ícones
/css
  tokens.css          o design system: cor, tipo, linha, espaço, movimento,
                      profundidade, camadas — nada declara um valor bruto
  reset.css           reset mínimo
  typography.css      @font-face locais e as três vozes tipográficas
  layout.css          o shell, a abertura, a estação, o fecho
  components.css      marcadores, deep dive, trilho, sobreposições, mapa
  responsive.css      notebook → Full HD → tablet → celular, e impressão
/data                 CONTEÚDO — a única pasta que um autor precisa tocar
  eras.js             as seis fases (rótulo, assinatura, faixa na timeline)
  chapters.js         os doze capítulos (metadados)
  beats.js            as estações narradas
  mindmap.js          os nós do mapa mental progressivo
  glossary.js         termos; alimenta o "Vocabulário à frente" no índice
/js
  /core
    namespace.js      o objeto global AIC
    config.js         TODA a configuração numérica: movimento, coreografia,
                      câmera, iluminação, orçamento de partículas
    bus.js            publish/subscribe + os nomes dos eventos
    dom.js            auxiliares de DOM e SVG
    utils.js          lerp, clamp, smoothstep, damp, random determinístico
    capabilities.js   detecção de WebGL, GSAP, ponteiro, viewport
    motion.js         política de movimento (sistema + override do leitor)
    registry.js       ponto de extensão dos módulos interativos
    store.js          estado da jornada
    debug.js          readout de desenvolvimento, atrás de ?debug=true
  /scene              o espaço do conhecimento
    path.js           a curva que câmera e corredor compartilham
    renderer.js       contexto WebGL, resize, laço de animação, pausa
    /layers
      dust.js         atmosfera (um draw call, deslocamento no shader)
      corridor.js     o eixo do tempo, com densidade progressiva
      knowledge.js    monta os constructs e governa presença e formação
    /constructs       a forma espacial de cada conceito
      kit.js          a linguagem de desenho: ordem, desaparecimento, foco
      turing-gate.js        1950 — um ponto, um eixo, treze marcas binárias
      dartmouth-split.js    1956 — um ponto vira dez, e os dez se encontram
      learning-lattice.js   ML — a grade de regras se dissolve; a estrutura
                            aprendida aparece no lugar
      attention-web.js      2017 — tokens e pesos, com a query percorrendo
    stage.js          compõe as camadas; traduz scroll em movimento de câmera
    fallback.js       equivalente em Canvas 2D quando não há WebGL
  /scroll
    journey.js        scroll → tempo
    choreography.js   as cinco fases de uma estação
  /ui                 componentes; todos recebem dados, nenhum recebe markup
    text.js           texto com destaque [[assim]]
    animate.js        os movimentos compartilhados, lidos de config.motion
    markers.js        CONCEPT / ENGINEERING / COPILOT
    flow.js           diagramas de fluxo
    deepdive.js       ESSENTIAL / ENGINEERING DEEP DIVE
    beats.js          gera as estações a partir de data/beats.js
    intro.js          a abertura
    chapters.js       o índice de capítulos e o fecho
    overlay.js        painel sobreposto genérico
    mindmap.js        o mapa mental completo
    mindmap-flash.js  o ramo que acabou de crescer, onde ele foi conquistado
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

## Sistema visual

Tudo abaixo vive em `css/tokens.css`, espelhado em `js/core/config.js` onde o
WebGL precisa dos mesmos números. Nenhum componente declara uma cor, um tempo
ou um easing próprio.

### Cor

O universo é **grafite e branco**. Cor não é decoração aqui: ela está reservada
para o pequeno número de coisas que carregam significado — o conceito ativo, um
termo em destaque, o marcador de posição. Todo o resto é linha neutra em alfa
baixo.

Cada era tem uma **assinatura**, não um esquema de cores: seis tons de baixa
saturação dentro de uma faixa deliberadamente estreita, todos na mesma
luminosidade. A identidade precisa continuar sendo uma identidade ao longo de
doze capítulos.

| Era | Assinatura | |
| --- | --- | --- |
| ORIGINS | `#8FA6BE` | aço frio |
| LEARNING | `#87A8B8` | |
| LANGUAGE | `#84AAAE` | |
| GENERATIVE AI | `#BCA98C` | a única quente — e a quebra é o ponto |
| COPILOT | `#95A0BE` | |
| AGENTS | `#A198BC` | |

A assinatura **nunca** é lavada sobre a cena inteira. Ela chega ao construct
daquela era, ao cursor do trilho e aos termos em destaque; o espaço permanece
grafite. Cor que está em todo lugar não é sinal.

Cada construct guarda a assinatura da sua própria era. Um conceito não muda de
cor porque você seguiu em frente.

### Tipografia

Três vozes, duas famílias (ambas locais):

| Voz | Uso | Fonte |
| --- | --- | --- |
| **DISPLAY** | coordenadas, a abertura, as perguntas | Inter, peso 180–250, tracking negativo, `opsz` no topo |
| **EDITORIAL** | as três linhas de narrativa | Inter, peso 300–400 |
| **TECHNICAL** | rótulos, fontes, termos, contadores | IBM Plex Mono, tracking aberto, caixa alta |

Monospace nunca em prosa: parágrafo monoespaçado lê como código, e isto não é
código.

### Linhas

Um vocabulário só, usado igual em CSS e em WebGL:

| Forma | Significa |
| --- | --- |
| contínua | evolução — o eixo do tempo, a estrutura de um conceito |
| tracejada | relação — um vínculo com algo ainda não alcançado |
| pulso | fluxo — dado em movimento |
| temporária | atenção — um peso que existe só enquanto importa |

### Movimento

Seis durações, três easings, um stagger. Sem bounce, sem elastic, sem
overshoot: movimento tecnológico é preciso, não brincalhão.

```
instant 120ms · short 220ms · base 380ms · long 640ms · slow 1.1s · cinematic 1.8s
ease-out    cubic-bezier(0.16, 0.84, 0.44, 1)
ease-in     cubic-bezier(0.55, 0, 0.9, 0.35)
ease-in-out cubic-bezier(0.62, 0.02, 0.24, 1)
stagger     90ms
```

`js/ui/animate.js` lê esses valores de `config.motion`. Se um movimento precisa
de uma duração que não está na lista, a lista está errada — não o movimento.

### Profundidade

Três planos, não mais: fundo, conteúdo, primeiro plano. Profundidade comunica
em vez de enfeitar — passado distante, conceito atual em foco, futuro como
pontos ainda pouco resolvidos além do plano de corte.

---

## O espaço do conhecimento

A primeira versão marcava cada beat com um anel idêntico. Um marcador diz *que*
há algo ali; um **construct** diz *o quê*.

| Estação | Construct | O que a forma argumenta |
| --- | --- | --- |
| 1950 | `turing-gate` | um ponto, um eixo, treze marcas binárias. A coisa mais vazia da jornada inteira — e precisa ser, porque tudo que vem depois só lê como acúmulo por contraste |
| 1956 | `dartmouth-split` | um ponto vira dez; os dez se encontram. Os raios desenham primeiro (pessoas separadas), as cordas depois (um campo coerindo) |
| Machine Learning | `learning-lattice` | uma grade ortogonal rígida se desfaz célula a célula enquanto uma estrutura irregular e derivada aparece no lugar. Ninguém desenhou a segunda |
| 2017 | `attention-web` | tokens e os pesos entre cada par. A posição de query percorre a linha: a estrutura é constante, a ênfase não |

### Como um construct se comporta

Duas coisas o governam, e mantê-las separadas é o que faz a camada funcionar:

**FORM** — quanto da estrutura já se desenhou. Dirigido pela coreografia da
própria estação. Quase toda a viagem da câmera em direção a um conceito
acontece enquanto a estação *anterior* está partindo; só pela distância, todo
construct estaria pronto antes do leitor chegar — e as regras do Machine
Learning se dissolveriam sem ninguém olhando.

**BRIGHTNESS** — quanto ele se impõe. Dirigido por onde a câmera realmente
está: uma semente lá na frente, cheio na estação, um resíduo depois de passar,
e fora do caminho enquanto a câmera passa ao lado.

Cada vértice carrega um `aOrder` (quando aparece) e um `aFade` (quando vai
embora). É assim que as regras se dissolvem enquanto o aprendizado surge, e é
assim que um peso de atenção pode existir só enquanto importa. Como são
posições numa curva e não animações disparadas, tudo está correto rolando para
trás e correto depois de um salto.

### Progressão

O universo fica mais denso conforme a jornada avança, e isso é geometria, não
efeito:

- o corredor começa com dois trilhos e graduação esparsa; ganha um segundo par
  na era do aprendizado, travessas na era da linguagem, e uma treliça externa
  depois disso — tudo assado na geometria, custo zero em runtime
- a atmosfera engrossa: 1950 é quase vácuo
- os capítulos ainda não escritos ficam adiante como sementes fracas, além do
  plano de corte, resolvendo conforme você avança. A estrada continuar faz
  parte da história

---

## Coreografia das estações

Toda estação — as quatro de hoje e as cinquenta do curso pronto — toca os
mesmos cinco movimentos. Chegar ao capítulo 11 precisa ter a mesma linguagem de
chegada do capítulo 01.

| Fase | O que acontece |
| --- | --- |
| **APPROACH** | a estação está à frente; sua estrutura é uma semente |
| **ARRIVAL** | a coordenada aterrissa, em escala, sozinha na tela |
| **REVEAL** | a coordenada assenta e vira rótulo; a pergunta emerge |
| **EXPLORE** | tudo parado e perfeitamente legível — a janela de leitura |
| **DEPARTURE** | o conceito se contrai e a próxima pergunta abre |

`js/scroll/choreography.js` é dono só do *tempo*. Ele converte o progresso da
estação em cinco valores normalizados e os publica; a copy, o construct 3D e o
mapa mental decidem cada um o que fazer com `reveal === 0.4`.

Nada aqui é animação disparada. Cada elemento é função pura da posição de
scroll, escrita como custom property na seção — o que significa que **rolar
para trás toca a chegada ao contrário** em vez de deixar a tela num estado do
qual ela não consegue sair. Isso é verificado, não presumido: o teste percorre
seis posições para a frente e as mesmas seis para trás e compara os valores de
fase de cada estação. A diferença medida é zero.

O stagger é calculado em CSS a partir de um `--si` por elemento, então o custo
por frame é uma escrita de propriedade por estação, não uma por elemento.

### A passagem de bastão

O `nextQuestion` de um beat é o `question` do beat seguinte, palavra por
palavra. O leitor vê uma pergunta se formar na partida, rola, e chega na
estação que a responde. É a costura da narrativa — e é verificada por um teste
que quebra se a cadeia for rompida.

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
  depth: 0.88,                 // posição na linha do tempo, 0..1
  coordinate: '2015',          // a coordenada que aterrissa na chegada
  source: 'Como o modelo lê',  // linha técnica pequena
  term: 'Token',               // o nome que o conceito recebeu
  construct: 'tokenizer-cut',  // → js/scene/constructs/

  // A cadeia narrativa. `question` precisa ser, palavra por palavra,
  // o `nextQuestion` do beat anterior.
  question: 'Se o modelo só enxerga números, o que exatamente ele lê?',
  essential: {
    marker: 'concept',
    discovery: 'Uma linha, no máximo duas. O que se descobriu.',
    concept: 'O conceito, com o termo em [[destaque]].',
    connection: 'O que isso custou, ou o que deixou em aberto.'
  },
  nextQuestion: 'E como o modelo sabe que dois tokens querem dizer a mesma coisa?',

  deepDive: {                  // camada ENGINEERING, atrás do botão
    title: 'O que acontece de verdade',
    intro: 'Uma frase de contexto.',
    flow: [
      { label: 'Text', note: 'a frase que você escreve' },
      { label: 'Tokenizer', note: 'quebra em unidades' }
    ],
    notes: ['Observação técnica.']
  },

  copilot: {                   // camada COPILOT
    surface: 'inline',         // 'inline' ao lado da copy, 'deepdive' no painel
    title: 'No dia a dia',
    body: 'Aplicação prática no Microsoft 365 Copilot.',
    example: null
  },

  mindmap: ['tokens'],         // conceitos que ESTE beat introduz — só eles
  lab: 'tokenizer-lab'         // módulo interativo, se houver
}
```

Copy curta é regra, não estilo. Uma ideia por linha, sem parágrafos: o
aprofundamento cabe no `deepDive`, que está a um clique e pode ser tão técnico
quanto precisar. Simplicidade aqui significa clareza, não superficialidade.

**2b. Verifique.**

```bash
node tools/check-content.mjs
```

Quebra se a cadeia narrativa for rompida, se os beats saírem de ordem na linha
do tempo, se um `construct`, capítulo, era ou nó de mapa referenciado não
existir, ou se dois beats afirmarem introduzir o mesmo conceito. Roda os
arquivos de `/data` do mesmo jeito que o navegador — sem build, sem framework
de teste.

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

Medido nesta versão, a 1920×1080: **6 draw calls** para o espaço inteiro,
775 nós de DOM, e tempo de frame idêntico nas três eras — a densidade crescente
do universo não custa nada em runtime porque está assada na geometria.

- Todo o espaço do conhecimento compartilha um material. Quatro constructs,
  o corredor, a atmosfera e as sementes do horizonte cabem em 6 draws.
- Partículas limitadas por orçamento (`config.dust`), reduzido automaticamente
  em telas pequenas. O deslocamento acontece no shader — nenhuma atualização
  de buffer por frame.
- A formação dos constructs é um uniform, não geometria reconstruída.
- `devicePixelRatio` limitado a 1.6 (1.3 em telas compactas).
- Um único `requestAnimationFrame` para toda a cena.
- A renderização **para por completo** quando a aba fica oculta.
- Em `prefers-reduced-motion` o laço nunca inicia: a cena desenha um quadro por
  atualização de scroll e fica imóvel no resto do tempo.
- O stagger da copy é calculado em CSS a partir de `--si`, então o custo por
  frame é uma escrita de propriedade por estação, não uma por elemento.
- Âncoras de scroll e a viagem da coordenada são medidas no load e no resize,
  nunca por frame. O resize é debounced.
- Perda de contexto WebGL é tratada; a cena volta se ele for restaurado.
- Os módulos interativos montam sob demanda, ao abrir o deep dive.

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
- `prefers-reduced-motion` é respeitado de verdade: sem movimento de câmera,
  sem parallax, sem sequência de abertura — e **nenhum conteúdo a menos**. Cada
  estação assenta no seu estado EXPLORE, com tudo presente e legível. O leitor
  pode sobrepor a preferência do sistema pelo botão de movimento na barra
  superior, e a escolha é lembrada.
- Nada essencial depende de hover: hover revela complemento, nunca conteúdo.
- Todo o texto é selecionável e real — nada de texto dentro de canvas.
- Contraste do corpo de texto acima de 7:1. O fundo 3D é escurecido por uma
  vinheta sob a coluna de leitura; o espaço inteiro recua enquanto o deep dive
  está aberto; e em telas de uma coluna, onde a copy fica *sobre* o construct
  em vez de ao lado, a cena inteira perde metade do peso.
- `Esc` fecha o deep dive e devolve o foco ao botão que o abriu.
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
- **Abaixo de 1080px a estação deixa de ser fixada** e vira uma seção alta
  normal rolando por trás do fundo. A coreografia continua tocando, mas a
  chegada da coordenada é uma mudança de escala no lugar, não uma viagem pelo
  quadro — não existe quadro fixo para ela atravessar.
- **O ramo do mapa mental não aparece em celulares.** Não há metade livre do
  quadro para ele surgir, e uma sobreposição por cima da copy é pior do que
  nenhuma. O contador na barra continua subindo e o mapa completo fica a um
  toque.
- **Os constructs não são reproduzidos no fallback 2D.** Um conceito em
  wireframe desenhado sem teste de profundidade lê como sujeira; lá o corredor
  e a copy carregam a narrativa.
- **Sem áudio.** A configuração já reserva o espaço (`config.audio`), mas nada
  carrega hoje, por decisão desta etapa.
- **Sem deep link por URL.** Recarregar preserva a posição de scroll (e a
  abertura não toca novamente), mas ainda não há `#capitulo-04` navegável.
  O `journey.goTo(id)` já existe; falta só ligá-lo ao `hashchange`.
- **O texto é provisório.** Os quatro momentos existem para validar ritmo
  narrativo e arquitetura, não como roteiro final.

---

## O que foi verificado

- **Console limpo** em cinco modos: desktop 1440, notebook 1366×768, celular
  390, movimento reduzido e sem WebGL.
- **Zero requisições externas.** Toda requisição é `file://` ou `data:`.
- **Simetria de scroll.** O teste percorre seis posições para a frente e as
  mesmas seis para trás e compara os valores de fase de cada estação. Diferença
  medida: zero. Voltar ao topo devolve todas as estações a APPROACH.
- **Integridade de conteúdo** por `node tools/check-content.mjs` — que
  encontrou e reprovou um bug real de dados na primeira execução.
- **Desempenho**: 6 draw calls, tempo de frame idêntico nas três eras.
- Sem rolagem horizontal em 390px; navegação por teclado, foco e devolução de
  foco nas sobreposições; deep dive abrindo, rolando e fechando em todas as
  larguras.

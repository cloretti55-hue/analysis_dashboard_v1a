const { useEffect, useState } = React;
const {
  MODULE_COPY,
  MOBILE_MODULES,
  moduleFromHash,
  themeFromHash,
  Disclaimer,
  HomeModule,
  useIsMobile,
  DesktopHeader,
  ThemeToggleButton,
  BrandCredit,
} = window.GCCommon;
const {
  useCurvesFedModel,
  MobileCurveModule,
  CurvesFedModule,
} = window.GCCurvesFed;
const {
  EquityValuationModule,
  FORWARD_PE_METHOD_NOTE,
} = window.GCValuation;
const { EtfsModule } = window.GCEtfs;
const { DataLabModule } = window.GCDataLab;

const TECH_CYCLES = [
  {
    cycle: "Ferrovias",
    capex: ["Muito alto", "capex-very"],
    excess: ["Alto", "risk-high"],
    destruction: ["Muito alta", "risk-very"],
    winners: ["Alto", "winner-high"],
    lesson: "Infraestrutura real; capital destruído.",
  },
  {
    cycle: "Eletrificação",
    capex: ["Alto", "capex-high"],
    excess: ["Médio", "risk-mid"],
    destruction: ["Média", "risk-mid"],
    winners: ["Alto", "winner-high"],
    lesson: "Escala captura valor.",
  },
  {
    cycle: "Dotcom",
    capex: ["Muito alto", "capex-very"],
    excess: ["Muito alto", "risk-very"],
    destruction: ["Muito alta", "risk-very"],
    winners: ["Muito alto", "winner-very"],
    lesson: "Tese certa; preço errado.",
  },
  {
    cycle: "IA atual",
    capex: ["Muito alto", "capex-very"],
    excess: ["Em formação", "unknown"],
    destruction: ["Ainda incompleta", "unknown"],
    winners: ["Indefinido", "unknown"],
    lesson: "Vencedores ainda em seleção.",
  },
];

const CYCLE_DETAILS = {
  Ferrovias: {
    anatomy:
      "O investimento era real: trilhos, terras, pontes, locomotivas e concessões. Nos EUA, o excesso de linhas, a dívida ferroviária e projetos antes da demanda alimentaram crises como 1873 e 1893. A infraestrutura ficou; muitos acionistas e credores quebraram. O valor migrou para redes consolidadas, rotas críticas e operadores com escala logística.",
    lesson: "Infraestrutura real não garante retorno para todo investidor.",
  },
  "Eletrificação": {
    anatomy:
      "O CAPEX criou usinas, redes de transmissão, distribuição urbana, motores elétricos e equipamentos industriais. A disputa entre padrões, utilities locais e fabricantes eliminou operadores sem escala. O domínio ficou com quem controlou equipamentos, rede e distribuição: General Electric, Westinghouse e grandes utilities reguladas.",
    lesson: "Valor não vem só da infraestrutura; vem quando ela vira uso recorrente e escala econômica.",
  },
  Dotcom: {
    anatomy:
      "A tese da internet estava certa, mas o capital entrou cedo demais e caro demais. Entre 1999 e 2002 houve excesso de fibra, telecom, servidores, portais e e-commerce sem lucro. WorldCom e Global Crossing simbolizaram a destruição em infraestrutura; Amazon, Google, Microsoft e Apple sobreviveram, escalaram e monetizaram.",
    lesson: "Tese certa pode destruir capital quando preço, timing e monetização estão errados.",
  },
  "IA atual": {
    anatomy:
      "O CAPEX é real: GPUs, HBM, networking, data centers, energia, cooling, cloud e modelos fundacionais. A captura inicial aparece em Nvidia, TSMC, ASML, Broadcom, hyperscalers, equipamentos elétricos e data centers. O risco não é a IA ser falsa; é pagar por sucesso perfeito antes da monetização final em aplicações.",
    lesson: "O ciclo é real, mas os vencedores finais ainda estão sendo escolhidos.",
  },
};

const AI_STACK = [
  ["Energia / Grid", "Demanda física: utilities, transmissão e equipamentos.", "money-now", "fluxo de CAPEX visível"],
  ["Data centers / Cooling", "Infraestrutura crítica: Vertiv, Eaton, Schneider, Equinix.", "money-now", "fluxo de CAPEX visível"],
  ["Chips / HBM / Networking", "Gargalo tecnológico: Nvidia, TSMC, Broadcom, ASML.", "money-flow", "captura acelerada"],
  ["Cloud / Hyperscalers", "Escala e distribuição: Microsoft, Amazon, Google, Oracle.", "money-forming", "monetização em formação"],
  ["Aplicações", "Monetização final: software, agentes e vertical apps.", "money-future", "prova ainda incompleta"],
];

const TECH_TIMELINE = [
  ["1", "Narrativa", ""],
  ["2", "CAPEX", "current-zone"],
  ["3", "Excesso", "current-zone"],
  ["4", "Quebra / seleção", ""],
  ["5", "Concentração dos ganhos", ""],
];

const GOVERNMENT_STACK = [
  ["Semicondutores", "CHIPS Act / Intel", "Reindustrialização e soberania de chips."],
  ["Quantum / supercomputação", "IBM, National Quantum Initiative, DOE labs", "Próxima fronteira de computação, criptografia e defesa."],
  ["Data centers / energia", "FERC, DOE, terrenos federais, grid", "IA precisa de eletricidade, conexão e licenciamento."],
  ["Defesa / segurança nacional", "Pentagon, cloud, IA militar, ciber", "Demanda estatal para tecnologias dual-use."],
  ["Pesquisa básica", "NSF, DARPA, DOE, universidades", "Estado financia a base científica antes da monetização privada."],
];

const THEME_BRIEFINGS = [
  {
    key: "gold-commodities",
    date: "04/08",
    label: "Ouro e commodities",
    title: "Ouro, bancos centrais e função das commodities",
    summary: "Ouro como reserva monetária, bancos centrais como demanda estrutural, investidores como impulso marginal e commodities com funções econômicas diferentes.",
    tags: ["Ouro", "Commodities", "Bancos centrais"],
    images: [
      {
        src: "assets/themes/equities-vs-commodities.png",
        title: "Ações vs. commodities: motores de precificação",
        comment: "Ações tendem a precificar crescimento, lucros e geração de caixa; commodities refletem escassez, oferta, demanda, estoques e choques. A distinção ajuda a entender por que as duas classes cumprem funções diferentes na carteira.",
      },
      {
        src: "assets/themes/gold-central-banks-2022-2026.png",
        title: "Ouro e bancos centrais: demanda oficial",
        comment: "A demanda oficial por ouro permanece historicamente elevada desde 2022. A leitura separa compras reportadas, atividade não divulgada e limites de atribuir todo o total global a países específicos.",
      },
      {
        src: "assets/themes/gold-supply-demand-price-2025-2026.png",
        title: "Oferta, demanda e formação do preço",
        comment: "Em 2025, o impulso marginal veio mais dos investidores, especialmente ETFs, enquanto bancos centrais compraram menos que em 2024, mas seguiram sustentando um piso estrutural para o mercado.",
      },
      {
        src: "assets/themes/gold-vs-commodities-functions.png",
        title: "Ouro vs. outras commodities: função econômica",
        comment: "Nem toda commodity é hedge. Ouro responde principalmente a riscos monetários e sistêmicos; energia, metais industriais e alimentos protegem choques diferentes e podem se comportar mal em recessões.",
      },
      {
        src: "assets/themes/gold-vs-commodities-etfs.png",
        title: "Commodities via ETFs: implementação",
        comment: "Exposição física, futuros e ações de produtoras não são equivalentes. Para medir a commodity, o veículo precisa capturar o preço físico ou futuro; para investir nas empresas, o risco passa a ser também operacional e acionário.",
      },
      {
        src: "assets/themes/gold-silver-ratio2.png",
        title: "Ouro vs. prata: o que o ratio mede",
        comment: "O Gold/Silver Ratio é uma leitura de liderança relativa e regime, não uma régua fixa de valuation. A média depende da janela, dos fundamentos e da estabilidade estatística da relação.",
      },
      {
        src: "assets/themes/commodities-specialized-etfs.png",
        title: "Commodities: ETFs especializados",
        comment: "Além das commodities principais, existem nichos como platina, paládio, gás natural, urânio, lítio, terras raras, minério de ferro, gado e água. A leitura separa exposição física, futuros e ações ligadas ao tema.",
      },
      {
        src: "assets/themes/commodities-sp500-10y.png",
        title: "Commodities e S&P 500: desempenho relativo",
        layout: "compact",
        comment: "O gráfico compara commodities, S&P 500 e CPI em base 100 e eixo logarítmico. A mensagem central é que commodities não se movem como um bloco único: correlação, volatilidade e regime importam mais do que o rótulo da classe.",
      },
      {
        src: "assets/themes/commodities-correlation-matrix-2016-2026.png",
        title: "Matriz de correlação: commodities e S&P 500",
        layout: "compact",
        comment: "A matriz mostra correlações semanais entre ouro, prata, petróleo, cobre, agricultura, commodities amplas e S&P 500. A leitura reforça que diversificação depende da relação entre ativos, não apenas do nome da classe.",
      },
    ],
  },
  {
    key: "ai-stress",
    date: "27/07",
    label: "IA Stress",
    title: "Big Tech, IA e estresse de capital",
    summary: "Capex de IA, compromissos fora do balanço e fluxo de caixa livre: o risco é real, mas precisa ser separado de exagero narrativo.",
    tags: ["IA", "CAPEX", "FCF"],
    images: [
      {
        src: "assets/themes/ai-stress-overview.png",
        title: "Big Tech, IA e passivos ocultos",
        comment: "A leitura separa compromisso contratual, dívida financeira e risco econômico. O ponto central é que CAPEX e obrigações futuras aumentam a pressão, mas não significam automaticamente crise de balanço.",
      },
      {
        src: "assets/themes/ai-stress-google.png",
        title: "Alphabet: FCF negativo no 2T26",
        comment: "O FCF negativo veio do CAPEX superando a geração operacional no trimestre. A operação continuou forte; a mudança relevante é a migração para um modelo mais intensivo em capital.",
      },
      {
        src: "assets/themes/ai-stress-beignet.png",
        title: "Projeto Beignet: estrutura mais agressiva",
        comment: "O caso ilustra como estruturas de JV, leasing, garantia residual e dívida em SPE podem deslocar parte da dívida formal para fora do balanço consolidado, preservando exposição econômica relevante para a Big Tech.",
      },
      {
        src: "assets/themes/ai-stress-fcf-cash.png",
        title: "Big Tech: FCF, caixa e CAPEX de IA",
        comment: "A comparação mostra que a pressão de CAPEX não atinge todas as empresas da mesma forma. O ponto relevante é separar queima temporária, reinvestimento agressivo e força de liquidez remanescente.",
      },
    ],
  },
  {
    key: "global-public-debt",
    date: "27/07",
    label: "Dívida pública global",
    title: "Dívida pública global: estoque, custo e crescimento",
    summary: "A leitura desloca o foco da dívida/PIB para o custo de carregamento: quando o juro implícito supera o crescimento nominal, a pressão fiscal muda de natureza.",
    tags: ["Macro", "Dívida", "r - g"],
    images: [
      {
        src: "assets/themes/global-public-debt-r-g.png",
        title: "Dívida, juro implícito e crescimento nominal",
        comment: "O ponto central não é apenas o tamanho da dívida, mas a relação entre custo de financiamento e crescimento nominal. Países com r abaixo de g têm mais espaço para estabilização; quando r supera g, o ajuste fiscal fica mais exigente.",
      },
    ],
  },
  {
    key: "ai-ecosystem",
    date: "20/07",
    label: "Ecossistema de IA",
    title: "Ecossistema de IA e Semicondutores",
    summary: "Extensão da tese de ciclos: formação bruta de capital fixo, CAPEX, hyperscalers, data centers, chips, memória e infraestrutura física da IA.",
    tags: ["IA", "Semicondutores", "Infraestrutura"],
    images: [
      {
        src: "assets/themes/ai-capex-fbcf.png",
        title: "Formação bruta de capital fixo como ponto de partida",
        comment: "O gráfico parte da FBCF/PIB para mostrar quando a economia transforma narrativa em investimento real. A IA entra nessa leitura como novo ciclo de capital físico: data centers, energia, chips e infraestrutura antes da monetização final em aplicações.",
      },
      {
        src: "assets/themes/ai-ecosystem.png",
        title: "Arquitetura do ecossistema de IA",
        comment: "A demanda nasce na camada de modelos e aplicações, mas desce para hyperscalers, operadores de data centers, servidores, chips, foundries e memória.",
      },
      {
        src: "assets/themes/semiconductor-ecosystem.png",
        title: "Semicondutores como cadeia crítica",
        comment: "A IA depende de uma cadeia especializada: design, IP, fabricação, packaging avançado, memória e montagem de sistemas. Não é apenas Nvidia.",
      },
    ],
  },
  {
    key: "corporate-revenue",
    date: "26/06",
    label: "Economia americana",
    title: "Receitas corporativas como retrato da economia americana",
    summary: "O mapa das maiores receitas americanas mostra uma economia pós-industrial: saúde, consumo online, tecnologia, energia, finanças e logística.",
    tags: ["Receitas", "EUA", "Setores"],
    images: [
      {
        src: "assets/themes/us-largest-companies-2025-original.png",
        title: "Receita corporativa como retrato da economia americana",
        layout: "tall",
        comment: "O gráfico mostra a base econômica sobre a qual os novos ciclos se encaixam: população envelhecendo gradualmente, consumo online, saúde em escala, tecnologia como infraestrutura cotidiana, logística nacional, energia e finanças profundas. Dados: Fortune via 50Pros; referência visual: Voronoi / Visual Capitalist; visual próprio.",
      },
    ],
  },
  {
    key: "tech-cycles",
    date: "26/06",
    label: "Ciclo tecnológico",
    title: "Matriz de Ciclos Tecnológicos",
    summary: "Ferrovias, eletrificação, dotcom e IA: primeiro vem CAPEX, depois excesso, seleção e concentração dos ganhos.",
    tags: ["IA", "CAPEX", "Semicondutores"],
  },
];

function TechCycleModule() {
  const [selectedCycle, setSelectedCycle] = useState("Ferrovias");
  const cycleDetail = CYCLE_DETAILS[selectedCycle] || CYCLE_DETAILS.Ferrovias;
  const intensity = (entry) =>
    React.createElement("span", { className: `intensity ${entry[1]}` }, entry[0]);

  return React.createElement(
    "main",
    { className: "tech-layout" },
    React.createElement(
      "section",
      { className: "tech-main" },
      React.createElement(
        "article",
        { className: "panel source-card" },
        React.createElement(
          "div",
          { className: "section-head" },
          React.createElement(
            "div",
            null,
            React.createElement("span", { className: "control-title" }, "Matriz de ciclos"),
            React.createElement("h2", null, "Inovação real não impede destruição de capital")
          )
        ),
        React.createElement(
          "div",
          { className: "cycle-table-wrap" },
          React.createElement(
            "table",
            { className: "cycle-table" },
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement("th", null, "Ciclo"),
                React.createElement("th", null, "CAPEX inicial"),
                React.createElement("th", null, "Excesso / bolha"),
                React.createElement("th", null, "Destruição de capital"),
                React.createElement("th", null, "Vencedores finais"),
                React.createElement("th", null, "Lição para IA")
              )
            ),
            React.createElement(
              "tbody",
              null,
              TECH_CYCLES.map((row) =>
                React.createElement(
                  "tr",
                  { key: row.cycle, className: selectedCycle === row.cycle ? "is-selected" : undefined, onClick: () => setSelectedCycle(row.cycle) },
                  React.createElement("td", null, row.cycle),
                  React.createElement("td", null, intensity(row.capex)),
                  React.createElement("td", null, intensity(row.excess)),
                  React.createElement("td", null, intensity(row.destruction)),
                  React.createElement("td", null, intensity(row.winners)),
                  React.createElement("td", { className: "lesson-cell" }, row.lesson)
                )
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "cycle-detail" },
          React.createElement("span", { className: "control-title" }, "Anatomia do ciclo"),
          React.createElement("h3", null, selectedCycle),
          React.createElement("p", null, cycleDetail.anatomy),
          React.createElement("p", { className: "cycle-lesson" }, `Lição para IA: ${cycleDetail.lesson}`)
        )
      ),
      React.createElement(
        "article",
        { className: "panel source-card" },
        React.createElement(
          "div",
          { className: "section-head" },
          React.createElement(
            "div",
            null,
            React.createElement("span", { className: "control-title" }, "Fluxo econômico"),
            React.createElement("h2", null, "O capital entra pela infraestrutura antes de aparecer na monetização final")
          )
        ),
        React.createElement(
          "div",
          { className: "stack-frame" },
          React.createElement(
            "div",
            { className: "stack-arrow", "aria-label": "Ler da infraestrutura para a monetização" }
          ),
          React.createElement(
            "div",
            { className: "ai-stack" },
            AI_STACK.map((layer) =>
              React.createElement(
                "div",
                { className: `stack-layer ${layer[2]}`, key: layer[0] },
                React.createElement("strong", null, layer[0]),
                React.createElement("span", null, layer[1]),
                React.createElement("div", { className: "money-tag" }, layer[3])
              )
            )
          )
        )
      )
    ),
    React.createElement(
      "section",
      { className: "panel source-card" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "control-title" }, "Linha do tempo"),
          React.createElement("h2", null, "Onde estamos na IA")
        )
      ),
      React.createElement(
        "div",
        { className: "timeline" },
        TECH_TIMELINE.map((step) =>
          React.createElement(
            "div",
            {
              className: `timeline-step ${step[2]}`,
              key: step[0],
              "aria-current": step[2] ? "step" : undefined,
            },
            React.createElement("span", null, step[0]),
            React.createElement("strong", null, step[1])
          )
        )
      ),
      React.createElement(
        "p",
        { className: "timeline-note" },
        "IA está na zona entre CAPEX acelerado e formação de excesso, antes da seleção completa dos vencedores."
      )
    ),
    React.createElement(
      "section",
      { className: "panel source-card" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "control-title" }, "Estado Estratégico"),
          React.createElement("h2", null, "Onde o governo aparece")
        )
      ),
      React.createElement(
        "div",
        { className: "cycle-table-wrap" },
        React.createElement(
          "table",
          { className: "policy-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Onde aparece"),
              React.createElement("th", null, "Exemplo"),
              React.createElement("th", null, "Por que importa")
            )
          ),
          React.createElement(
            "tbody",
            null,
            GOVERNMENT_STACK.map((row) =>
              React.createElement(
                "tr",
                { key: row[0] },
                React.createElement("td", null, row[0]),
                React.createElement("td", null, row[1]),
                React.createElement("td", null, row[2])
              )
            )
          )
        )
      )
    )
  );
}

function ThemesModule() {
  const imageZoomLevels = [0.5, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.5];
  const [selectedTheme, setSelectedTheme] = useState(() => themeFromHash() || THEME_BRIEFINGS[0].key);
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const activeTheme = THEME_BRIEFINGS.find((item) => item.key === selectedTheme) || THEME_BRIEFINGS[0];

  useEffect(() => {
    const syncThemeFromHistory = () => {
      const parts = hashParts();
      const nextTheme = parts[0] === "tech" ? parts[1] : null;
      const nextThemeRecord = THEME_BRIEFINGS.find((item) => item.key === nextTheme) || THEME_BRIEFINGS[0];
      setSelectedTheme(nextThemeRecord.key);

      const imageMatch = /^image-(\d+)$/.exec(parts[2] || "");
      const imageIndex = imageMatch ? Number(imageMatch[1]) : -1;
      setExpandedImage(nextThemeRecord.images?.[imageIndex] || null);
      setImageZoom(1);
    };

    window.addEventListener("popstate", syncThemeFromHistory);
    return () => window.removeEventListener("popstate", syncThemeFromHistory);
  }, []);

  useEffect(() => {
    if (!expandedImage) return undefined;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const previousRootOverflow = root.style.overflow;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.paddingRight = previousBodyStyles.paddingRight;
    };
  }, [expandedImage]);

  const selectTheme = (key) => {
    setSelectedTheme(key);
    setExpandedImage(null);
    setImageZoom(1);
    window.history.pushState({ module: "tech", theme: key }, "", `#tech/${key}`);
  };

  const openImage = (image, index) => {
    setExpandedImage(image);
    setImageZoom(1);
    window.history.pushState({ module: "tech", theme: activeTheme.key, image: index }, "", `#tech/${activeTheme.key}/image-${index}`);
  };

  const closeImage = () => {
    if (hashParts()[2]?.startsWith("image-")) {
      window.history.back();
      return;
    }
    setExpandedImage(null);
    setImageZoom(1);
  };

  const adjustImageZoom = (direction) => {
    setImageZoom((value) => {
      const currentIndex = imageZoomLevels.findIndex((level) => Math.abs(level - value) < 0.001);
      const nextIndex = Math.min(
        imageZoomLevels.length - 1,
        Math.max(0, currentIndex + direction)
      );
      return imageZoomLevels[nextIndex];
    });
  };

  return React.createElement(
    React.Fragment,
      null,
      React.createElement(
        "main",
        { className: "themes-layout" },
        React.createElement(
          "aside",
          { className: "panel themes-feed" },
          React.createElement(
            "div",
            { className: "section-head" },
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "control-title" }, "Biblioteca"),
              React.createElement("h2", null, "Páginas temáticas")
            )
          ),
          THEME_BRIEFINGS.map((item) =>
            React.createElement(
              "button",
              {
                className: "theme-news-card",
                type: "button",
                key: item.key,
                "aria-pressed": activeTheme.key === item.key,
                onClick: () => selectTheme(item.key),
              },
              React.createElement("small", null, item.date),
              React.createElement("h3", null, item.title),
              React.createElement("p", null, item.summary),
              React.createElement(
                "div",
                { className: "theme-news-meta" },
                item.tags.map((tag) => React.createElement("span", { key: tag }, tag))
              )
            )
          )
        ),
        React.createElement(
          "section",
          { className: "themes-preview" },
          React.createElement(
            "article",
            { className: "panel themes-preview-head" },
            React.createElement("span", { className: "control-title" }, activeTheme.label),
            React.createElement("h2", null, activeTheme.title),
            React.createElement("p", null, activeTheme.summary),
            activeTheme.pdf
              ? React.createElement(
                  "div",
                  { className: "theme-file-actions" },
                  React.createElement(
                    "a",
                    { href: activeTheme.pdf.href, target: "_blank", rel: "noreferrer" },
                    activeTheme.pdf.label
                  )
                )
              : null
          ),
          activeTheme.images
            ? React.createElement(
                "div",
                { className: "theme-image-gallery" },
                activeTheme.images.map((image, index) =>
                  React.createElement(
                    "button",
                    {
                      className: `panel theme-image-card ${image.layout === "tall" ? "is-tall" : ""} ${image.layout === "compact" ? "is-compact" : ""}`,
                      key: image.src,
                      type: "button",
                      onClick: () => openImage(image, index),
                    },
                    React.createElement("img", { src: image.src, alt: image.title }),
                    React.createElement(
                      "div",
                      { className: "theme-image-caption" },
                      React.createElement("strong", null, image.title),
                      React.createElement("p", null, image.comment)
                    )
                  )
                )
              )
            : null,
          activeTheme.key === "tech-cycles" ? React.createElement(TechCycleModule) : null
        )
      ),
      expandedImage
        ? React.createElement(
            "div",
            { className: "image-lightbox", role: "dialog", "aria-modal": true, onClick: closeImage },
            React.createElement(
              "div",
              { className: "image-lightbox-inner", onClick: (event) => event.stopPropagation() },
              React.createElement(
                "div",
                { className: "image-lightbox-stage" },
                React.createElement("img", {
                  src: expandedImage.src,
                  alt: expandedImage.title,
                  "data-zoomed": imageZoom > 1,
                  style: { width: `${imageZoom * 100}%` },
                })
              ),
              React.createElement(
                "div",
                { className: "image-lightbox-caption" },
                React.createElement(
                  "div",
                  null,
                  React.createElement("strong", null, expandedImage.title),
                  React.createElement("span", null, expandedImage.comment)
                ),
                React.createElement(
                  "div",
                  { className: "image-lightbox-actions" },
                  React.createElement(
                    "div",
                    { className: "image-zoom-controls", "aria-label": "Controles de zoom da imagem" },
                    React.createElement("button", { type: "button", onClick: () => adjustImageZoom(-1), disabled: imageZoom <= 0.5 }, "-"),
                    React.createElement("span", null, `${Math.round(imageZoom * 100)}%`),
                    React.createElement("button", { type: "button", onClick: () => adjustImageZoom(1), disabled: imageZoom >= 2.5 }, "+"),
                    React.createElement("button", { type: "button", onClick: () => setImageZoom(1) }, "100%")
                  ),
                  React.createElement("button", { type: "button", onClick: closeImage }, "Fechar")
                )
              )
            )
          )
        : null
  );
}

function MobileModuleContent({ activeModule, theme, curvesFed }) {
  if (activeModule === "curve") {
    return React.createElement(MobileCurveModule, { theme, model: curvesFed });
  }
  if (activeModule === "equity") return React.createElement(EquityValuationModule);
  if (activeModule === "tech") return React.createElement(ThemesModule);
  if (activeModule === "etfs") return React.createElement(EtfsModule);
  if (activeModule === "dataLab") return React.createElement(DataLabModule);
  return React.createElement(EtfsModule);
}

function MobileDashboard({ activeModule, setActiveModule, theme, setTheme, curvesFed }) {
  const [mobileModule, setMobileModule] = useState(null);
  const selectedModule = mobileModule || activeModule;
  const selectedCopy = MODULE_COPY[selectedModule];

  const openModule = (key) => {
    setActiveModule(key);
    setMobileModule(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeModule = () => {
    setMobileModule(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return React.createElement(
    "div",
    { className: "mobile-shell" },
    React.createElement(
      "header",
      { className: "mobile-top" },
      React.createElement(
        "div",
        { className: "mobile-brand" },
        React.createElement("span", null, mobileModule ? "Módulo" : "Dashboard"),
        React.createElement("strong", null, mobileModule ? MOBILE_MODULES.find(([key]) => key === selectedModule)?.[1] : "Dashboard")
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: "8px" } },
        mobileModule
          ? React.createElement("button", { className: "mobile-icon-btn", type: "button", onClick: closeModule }, "Voltar")
          : null,
        React.createElement(ThemeToggleButton, { theme, setTheme, className: "mobile-icon-btn" })
      )
    ),
    mobileModule
      ? React.createElement(
          "section",
          { className: "mobile-module-view" },
          React.createElement(
            "article",
            { className: "panel mobile-module-head" },
            React.createElement("h1", null, selectedCopy.title),
            React.createElement("p", null, selectedCopy.lead)
          ),
React.createElement(MobileModuleContent, { activeModule: selectedModule, theme, curvesFed }),
          React.createElement(Disclaimer, { dataLab: selectedModule === "dataLab", methodNote: selectedModule === "equity" ? FORWARD_PE_METHOD_NOTE : null })
        )
      : React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "section",
            { className: "mobile-hero" },
            React.createElement("h1", null, "Arquitetura Global"),
            React.createElement("p", null, "Macro, valuation, temas e veículos em uma única leitura.")
          ),
          React.createElement(
            "section",
            { className: "mobile-module-grid" },
            MOBILE_MODULES.map(([key, label, color]) =>
              React.createElement(
                "button",
                {
                  className: "mobile-module-card",
                  key,
                  type: "button",
                  style: { "--mobile-accent": color },
                  onClick: () => openModule(key),
                },
                React.createElement(
                  "div",
                  null,
                  React.createElement("h2", null, label),
                  React.createElement("p", null, MODULE_COPY[key].lead)
                )
              )
            )
          ),
          React.createElement(Disclaimer, { full: true }),
          React.createElement(BrandCredit)
        )
  );
}

function App() {
  const [activeModule, setActiveModuleState] = useState(() => moduleFromHash());
  const [theme, setTheme] = useState("light");
  const curvesFed = useCurvesFedModel();
  const isMobile = useIsMobile();

  const setActiveModule = (key) => {
    setActiveModuleState(key);
    window.history.pushState({ module: key }, "", key === "home" ? `${window.location.pathname}${window.location.search}` : `#${key}`);
  };

  useEffect(() => {
    const syncModuleFromHistory = () => {
      setActiveModuleState(moduleFromHash());
    };
    window.addEventListener("popstate", syncModuleFromHistory);
    return () => window.removeEventListener("popstate", syncModuleFromHistory);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    return () => document.body.classList.remove("theme-light");
  }, [theme]);


  if (isMobile) {
    return React.createElement(MobileDashboard, {
      activeModule,
      setActiveModule,
      theme,
      setTheme,
      curvesFed,
    });
  }

  return React.createElement(
    "div",
    { className: "app" },
    activeModule === "home"
      ? null
      : React.createElement(DesktopHeader, { activeModule, setActiveModule, theme, setTheme }),
    activeModule === "home"
      ? React.createElement(HomeModule, { setActiveModule, theme, setTheme })
      : activeModule === "curve"
      ? React.createElement(CurvesFedModule, { theme, model: curvesFed })
      : activeModule === "equity"
        ? React.createElement(EquityValuationModule)
        : activeModule === "tech"
          ? React.createElement(ThemesModule)
          : activeModule === "etfs"
            ? React.createElement(EtfsModule)
            : activeModule === "dataLab"
              ? React.createElement(DataLabModule)
              : React.createElement(EtfsModule),
    activeModule === "home" ? null : React.createElement(Disclaimer, { dataLab: activeModule === "dataLab", methodNote: activeModule === "equity" ? FORWARD_PE_METHOD_NOTE : null })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

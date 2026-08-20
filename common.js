window.GCCommon = (() => {
function formatDatePtBr(dateText) {
  if (!dateText) return "";
  const match = String(dateText).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(dateText);
}

function formatDatesInText(text) {
  return text == null
    ? ""
    : String(text).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, year, month, day) => `${day}/${month}/${year}`);
}

const DATASET_STATUS_LABELS = {
  ok: "Atual",
  stale: "Defasado",
  partial: "Parcial",
  manual: "Manual",
  error: "Erro",
  unavailable: "Indisponível",
  unknown: "Disponível",
};

function DatasetStatusLine({ result, label }) {
  if (!result) {
    return React.createElement(
      "div",
      { className: "dataset-status-line" },
      React.createElement("strong", null, label),
      React.createElement("span", null, "Carregando metadados...")
    );
  }

  const meta = result.meta || {};
  const status = result.ok ? (meta.status || "unknown") : "unavailable";
  const publicSource = meta.id === "etf-performance"
    ? "Yahoo Finance"
    : meta.id === "fixed-income-performance"
    ? "Yahoo Finance e Federal Reserve (FRED)"
    : meta.source;
  return React.createElement(
    "div",
    { className: "dataset-status-line" },
    React.createElement("strong", null, label || meta.id),
    React.createElement("span", { className: "dataset-status-badge", "data-status": status }, DATASET_STATUS_LABELS[status] || status),
    meta.asOf ? React.createElement("span", null, `Dados de ${formatDatePtBr(meta.asOf)}`) : null,
    publicSource ? React.createElement("span", null, `Fonte: ${publicSource}`) : null
  );
}

const MODULE_COPY = {
  home: {
    title: "Visão geral",
    lead: "",
    thesis: "Visão geral",
    subtitle: "Macro, valuation, instrumentos, dados e temas",
  },
  curve: {
    title: "Macro: juros dos EUA",
    lead: "Curvas nominais, juros reais, inflação implícita e política monetária em uma leitura integrada.",
    thesis: "Macro",
    subtitle: "Curvas e política monetária",
  },
  equity: {
    title: "Valuation de ações",
    lead: "Múltiplos observados, comparações históricas e concentração no mercado americano.",
    thesis: "Valuation",
    subtitle: "Múltiplos e concentração",
  },
  tech: {
    title: "Temas estruturais",
    lead: "Páginas educacionais sobre ciclos tecnológicos, mapas setoriais e mudanças estruturais.",
    thesis: "Temas",
    subtitle: "Ciclos e mudanças estruturais",
  },
  core: {
    title: "Como o veículo altera a exposição",
    lead: "ETFs diferem em liquidez, fiscalidade, acumulação, hedge, concentração e eficiência operacional.",
    thesis: "Instrumentos",
    subtitle: "Exposição, veículo e características",
  },
};

MODULE_COPY.satellites = {
  title: "Satélites: motor econômico, instrumento e risco",
  lead: "A leitura compara o motor econômico de cada tema com o veículo e os riscos de implementação.",
  thesis: "Instrumentos",
  subtitle: "Convexidade, veículo e risco",
};

MODULE_COPY.europe = {
  title: "Europa: exposição ampla e recortes temáticos",
  lead: "A exposição ampla diversifica; recortes de defesa, luxo, saúde, tecnologia e indústria alteram concentração e risco.",
  thesis: "Instrumentos",
  subtitle: "Exposição ampla e recortes",
};

MODULE_COPY.china = {
  title: "China: canais diretos, indiretos e China+1",
  lead: "A exposição à economia chinesa pode ocorrer por ações locais, empresas globais, commodities ou cadeias produtivas alternativas.",
  thesis: "Instrumentos",
  subtitle: "Canais de exposição",
};

MODULE_COPY.hedges = {
  title: "Estratégias líquidas de hedge",
  lead: "Instrumentos líquidos de hedge diferem em payoff, beta, volatilidade, moeda e custo de carregamento.",
  thesis: "Instrumentos",
  subtitle: "Payoff, beta, volatilidade e moeda",
};

MODULE_COPY.etfs = {
  title: "Instrumentos e veículos",
  lead: "ETFs, exposições setoriais e estruturas de hedge descritos por função, características e limitações.",
  thesis: "Instrumentos",
  subtitle: "ETFs, exposições e hedge",
};

MODULE_COPY.dataLab = {
  title: "Data Lab",
  lead: "Comparação quantitativa de retorno, risco, drawdown, correlação e benchmark dos instrumentos monitorados.",
  thesis: "Dados",
  subtitle: "Métricas e séries históricas",
};

const HOME_CARDS = [
  ["curve", "Macro", "Juros dos EUA", "Curvas nominais, reais, inflação implícita, Fed Funds e inclinações.", "#48d6e9"],
  ["equity", "Valuation", "Equity Valuation", "Múltiplos, Magnificent 7, dispersão e prêmio relativo do mercado americano.", "#6ee7b7"],
  ["etfs", "Instrumentos", "ETFs e veículos", "Renda fixa, ações amplas, setores, satélites, China, Europa e hedge.", "#8db7ff"],
  ["dataLab", "Dados", "Data Lab", "Retorno, volatilidade, drawdown, beta, correlação e benchmark dos ETFs.", "#6ee7b7"],
  ["tech", "Temas", "Páginas temáticas", "Ciclos tecnológicos, mapas setoriais e mudanças estruturais.", "#ffae6b"],
];

const MAIN_NAV = [
  ["home", "Visão geral"],
  ["curve", "Macro"],
  ["equity", "Valuation"],
  ["etfs", "Instrumentos"],
  ["dataLab", "Data Lab"],
  ["tech", "Temas"],
];

const MODULE_KEYS = new Set(MAIN_NAV.map(([key]) => key));

function hashParts() {
  return window.location.hash.replace(/^#/, "").split("/").filter(Boolean);
}

function moduleFromHash() {
  const [module] = hashParts();
  return MODULE_KEYS.has(module) ? module : "home";
}

function themeFromHash() {
  const [module, theme] = hashParts();
  return module === "tech" && theme ? theme : null;
}

const MOBILE_MODULES = [
  ["curve", "Macro", "#48d6e9"],
  ["equity", "Valuation", "#6ee7b7"],
  ["etfs", "Instrumentos", "#8db7ff"],
  ["dataLab", "Data Lab", "#6ee7b7"],
  ["tech", "Temas", "#ffae6b"],
];

const ANALYSIS_GUIDE_ITEMS = [
  ["fact", "Fato", "Dado observado, acompanhado de data e fonte."],
  ["calculation", "Cálculo", "Métrica derivada ou comparação entre dados."],
  ["interpretation", "Interpretação", "Leitura analítica e educacional do contexto."],
  ["limitation", "Limitação", "Hipótese, escopo ou restrição relevante."],
];

const FULL_DISCLAIMER =
  "Dados e análises para fins informativos e educacionais. Não constituem recomendação de investimento, consultoria financeira, tributária ou legal. Informações podem conter atrasos, aproximações ou divergências entre provedores. Verifique fontes, preços, custos, riscos e adequação antes de qualquer decisão.";

const SHORT_DISCLAIMER =
  "Conteúdo informativo e educacional. Não constitui recomendação de investimento ou tributária. Dados podem estar defasados, aproximados ou sujeitos a revisão.";

const DATALAB_DISCLAIMER_EXTRA =
  "Retorno total aproximado via adjusted close; S&P 500 aproximado por SPY e Nasdaq-100 aproximado por QQQ; dados sujeitos a atraso e revisão.";

function Disclaimer({ full = false, dataLab = false, methodNote = null }) {
  return React.createElement(
    "section",
    { className: "panel disclaimer-panel" },
    methodNote ? React.createElement("span", { className: "method-note" }, methodNote) : null,
    full ? React.createElement("strong", null, "Disclaimer") : null,
    React.createElement("span", null, full ? FULL_DISCLAIMER : `${SHORT_DISCLAIMER}${dataLab ? ` ${DATALAB_DISCLAIMER_EXTRA}` : ""}`)
  );
}

function AnalysisGuide({ compact = false }) {
  return React.createElement(
    "section",
    {
      className: `panel analysis-guide${compact ? " is-compact" : ""}`,
      "aria-label": "Como interpretar o conteúdo",
    },
    ANALYSIS_GUIDE_ITEMS.map(([kind, label, text]) =>
      React.createElement(
        "div",
        { className: "analysis-guide-item", "data-kind": kind, key: kind },
        React.createElement("strong", null, label),
        React.createElement("span", null, text)
      )
    )
  );
}

function ThemeToggleButton({ theme, setTheme, className }) {
  return React.createElement(
    "button",
    {
      className,
      type: "button",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    theme === "dark" ? "Claro" : "Escuro"
  );
}

function ThemeSwitch({ theme, setTheme }) {
  return React.createElement(
    "div",
    { className: "theme-switch" },
    React.createElement("span", null, "Tema"),
    React.createElement(ThemeToggleButton, { theme, setTheme })
  );
}

function MainNavigation({ activeModule, setActiveModule }) {
  return React.createElement(
    "nav",
    { className: "view-tabs", "aria-label": "Módulos do dashboard" },
    MAIN_NAV.map(([key, label]) =>
      React.createElement(
        "button",
        {
          className: "view-tab",
          type: "button",
          key,
          "aria-current": activeModule === key ? "page" : undefined,
          onClick: () => setActiveModule(key),
        },
        label
      )
    )
  );
}

function DesktopHeader({ activeModule, setActiveModule, theme, setTheme }) {
  const copy = MODULE_COPY[activeModule];
  return React.createElement(
    "header",
    { className: "topbar" },
    React.createElement(
      "section",
      null,
      React.createElement(MainNavigation, { activeModule, setActiveModule }),
      React.createElement("h1", null, copy.title),
      copy.lead ? React.createElement("p", { className: "lead" }, copy.lead) : null
    ),
    React.createElement(
      "aside",
      { className: "header-side" },
      React.createElement(ThemeSwitch, { theme, setTheme })
    )
  );
}

function BrandCredit() {
  return React.createElement("span", { className: "brand-credit" }, "Designed by General Channels Co.");
}

function HomeModule({ setActiveModule, theme, setTheme }) {
  return React.createElement(
    "main",
    { className: "home-layout" },
    React.createElement(
      "section",
      { className: "panel home-hero" },
      React.createElement(
        "div",
        null,
        React.createElement("h2", null, "Arquitetura Global"),
        React.createElement("p", null, "Macro, valuation, instrumentos, dados e temas em uma única leitura.")
      ),
      React.createElement(ThemeSwitch, { theme, setTheme })
    ),
    React.createElement(
      "section",
      { className: "home-grid" },
      HOME_CARDS.map(([key, layer, title, text, color]) =>
        React.createElement(
          "button",
          {
            className: "home-card",
            key,
            type: "button",
            style: { "--home-accent": color },
            onClick: () => setActiveModule(key),
          },
          React.createElement(
            "div",
            null,
            React.createElement("span", null, layer),
            React.createElement("h3", null, title),
            React.createElement("p", null, text)
          ),
          React.createElement("small", null, "Abrir módulo")
        )
      )
    ),
    React.createElement(Disclaimer, { full: true }),
    React.createElement(BrandCredit)
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

return Object.freeze({
  formatDatePtBr,
  DATASET_STATUS_LABELS,
  DatasetStatusLine,
  MODULE_COPY,
  MOBILE_MODULES,
  moduleFromHash,
  themeFromHash,
  Disclaimer,
  AnalysisGuide,
  HomeModule,
  useIsMobile,
  DesktopHeader,
  ThemeToggleButton,
  BrandCredit,
});
})();

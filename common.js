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
    title: "Dashboard",
    lead: "",
    thesis: "Dashboard",
    subtitle: "Macro, valuation, temas e dados",
  },
  curve: {
    title: "Yield Curves",
    lead: "",
    thesis: "Carry",
    subtitle: "Duration moderada (2.3y)",
  },
  equity: {
    title: "Stock Market Valuation",
    lead: "",
    thesis: "Concentração",
    subtitle: "Prêmio na Magnificent 7",
  },
  tech: {
    title: "Temas",
    lead: "Páginas temáticas para acompanhar teses atuais, mapas setoriais, ciclos tecnológicos e mudanças estruturais.",
    thesis: "Temas",
    subtitle: "Páginas atuais",
  },
  core: {
    title: "O veículo define a exposição real da carteira",
    lead: "Em carteiras globais, ETF não é só custo: define liquidez, fiscalidade, acumulação, hedge, concentração e eficiência operacional.",
    thesis: "Implementação",
    subtitle: "Exposição, veículo e função",
  },
};

MODULE_COPY.satellites = {
  title: "Satélites combinam convexidade, veículo e tamanho de risco",
  lead: "A alocação satélite não é lista de temas: cada tese precisa casar motor econômico, instrumento e risco de implementação.",
  thesis: "Convexidade",
  subtitle: "ETF vs cesta",
};

MODULE_COPY.europe = {
  title: "Na Europa, o core compra o continente — a cesta compra a tese",
  lead: "A exposição ampla diversifica. As melhores teses exigem seleção: defesa, luxo, pharma, soberania digital e industriais.",
  thesis: "Seleção",
    subtitle: "Temas europeus",
};

MODULE_COPY.china = {
  title: "China continua relevante — mas o canal de exposição importa mais",
  lead: "A economia chinesa segue central para consumo, manufatura, commodities e cadeias globais. Isso não significa que a melhor forma de capturar China seja comprar ações chinesas diretamente.",
  thesis: "Canal",
  subtitle: "Direta, indireta ou China+1",
};

MODULE_COPY.hedges = {
  title: "Estratégias líquidas de hedge",
  lead: "Quando Treasuries, TIPS, caixa e ouro já estão cobertos em outras camadas, hedge vira engenharia de payoff, beta e volatilidade.",
  thesis: "Payoff",
  subtitle: "Opções, beta e volatilidade",
};

MODULE_COPY.etfs = {
  title: "Arquitetura de ETFs",
  lead: "",
  thesis: "Implementacao",
  subtitle: "Core, satelites e hedge",
};

MODULE_COPY.dataLab = {
  title: "Data Lab",
  lead: "",
  thesis: "Dados",
  subtitle: "Retorno, risco e benchmark",
};

const HOME_CARDS = [
  ["curve", "Rates", "Yield Curves", "Curvas nominais, reais, inflação implícita, Fed Funds e inclinações.", "#48d6e9"],
  ["equity", "Valuation", "Equity Valuation", "Múltiplos, Magnificent 7, dispersão e prêmio relativo do mercado americano.", "#6ee7b7"],
  ["etfs", "Veículos", "ETFs", "Core equities, renda fixa, setoriais, satélites, China, Europa e hedge.", "#8db7ff"],
  ["dataLab", "Dados", "Data Lab", "Retorno, volatilidade, drawdown, beta, correlação e benchmark dos ETFs.", "#6ee7b7"],
  ["tech", "Temas", "Páginas temáticas", "Teses atuais, mapas setoriais, ciclos tecnológicos e gargalos econômicos.", "#ffae6b"],
];

const MAIN_NAV = [
  ["home", "Home"],
  ["curve", "Rates"],
  ["equity", "Valuation"],
  ["etfs", "ETFs"],
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
  ["curve", "Rates", "#48d6e9"],
  ["equity", "Equity Valuation", "#6ee7b7"],
  ["etfs", "ETFs", "#8db7ff"],
  ["dataLab", "Data Lab", "#6ee7b7"],
  ["tech", "Temas", "#ffae6b"],
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
        React.createElement("p", null, "Macro, valuation, temas e veículos em uma única leitura.")
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
  HomeModule,
  useIsMobile,
  DesktopHeader,
  ThemeToggleButton,
  BrandCredit,
});
})();

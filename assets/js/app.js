const { useEffect, useState } = React;
const {
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

const DATA_LAB_METRICS = [
  ["returnYtdPct", "YTD"],
  ["return1yPct", "1 ano"],
  ["return3yAnnPct", "Retorno anualizado 3 anos"],
  ["return5yAnnPct", "Retorno anualizado 5 anos"],
  ["vol1yAnnPct", "Volatilidade anualizada 1 ano"],
  ["maxDrawdown1yPct", "Max Drawdown 1 ano"],
  ["beta1yVsSp500", "Beta 1 ano"],
];

const renderMetricLabel = (label) =>
  label === "Volatilidade anualizada 1 ano"
    ? React.createElement(React.Fragment, null, "Volatilidade anualizada", React.createElement("span", null, "1 ano"))
    : label;

const DATA_LAB_GROUPS = ["Fixed Income", "Core Equities", "Setoriais", "Satélites EUA", "Temas Europeus", "China / China+1", "Hedge"];
const NASDAQ_BENCHMARK_TICKERS = new Set(["JEPQ", "QYLD", "QQEW", "PSQ", "QID", "SQQQ"]);

const dataLabGroupFor = (item) => {
  const category = (item?.category || "").toLowerCase();
  if (category.includes("gics sector")) return "Setoriais";
  if (category.includes("covered call") || category.includes("minimum volatility") || category.includes("vix") || category.includes("inverse") || category.includes("concentration hedge") || category.includes("gold") || category.includes("swiss franc")) return "Hedge";
  if (category.includes("treasuries") || category.includes("treasury bills") || category.includes("inflation usd") || category.includes("credit") || category.includes("high yield") || category.includes("core bond")) return "Fixed Income";
  if (category.includes("china") || category.includes("em ex-china") || category.includes("china+1") || category.includes("asia technology") || category.includes("copper miners") || category.includes("metals and mining")) return "China / China+1";
  if (category.includes("luxury") || category.includes("europe healthcare") || category.includes("global healthcare")) return "Temas Europeus";
  if (category.startsWith("core") || category.includes("s&p 500 benchmark") || category.includes("us growth") || category.includes("nasdaq-100")) return "Core Equities";
  return "Satélites EUA";
};

const DATA_LAB_SUBGROUP_ORDER = {
  "Fixed Income": ["Liquidez USD", "Treasuries por duration", "TIPS / inflação", "Crédito USD", "Core bond global"],
  "Core Equities": ["EUA amplo", "Growth / Nasdaq", "Core global desenvolvido", "Developed ex-US", "Europa core", "Emergentes"],
  Setoriais: ["Growth / comunicação", "Cíclicos", "Defensivos / yield", "Outros setores"],
  "Satélites EUA": ["IA / semicondutores", "Segurança / defesa", "Infraestrutura / energia", "Onshoring / reindustrialização", "Opcionalidade tecnológica", "Economia restrita"],
  "Temas Europeus": ["Defesa", "Luxo / China indireta", "Pharma / healthcare", "Industriais / eletrificação", "Soberania digital"],
  "China / China+1": ["China direta", "China indireta", "China+1", "EM ex-China"],
  Hedge: ["Option income", "Redução de beta", "Volatilidade", "Hedge direcional", "Desconcentração", "Macro"],
};

const dataLabSubgroupFor = (item) => {
  const category = (item?.category || "").toLowerCase();
  const ticker = item?.ticker || "";
  const group = dataLabGroupFor(item);

  if (group === "Fixed Income") {
    if (category.includes("treasury bills") || category.includes("liquidity")) return "Liquidez USD";
    if (category.includes("treasuries")) return "Treasuries por duration";
    if (category.includes("inflation")) return "TIPS / inflação";
    if (category.includes("credit") || category.includes("high yield")) return "Crédito USD";
    return "Core bond global";
  }

  if (group === "Core Equities") {
    if (category.includes("s&p 500 benchmark") || category.includes("core us equity")) return "EUA amplo";
    if (category.includes("nasdaq") || category.includes("us growth")) return "Growth / Nasdaq";
    if (category.includes("global developed")) return "Core global desenvolvido";
    if (category.includes("developed ex-us")) return "Developed ex-US";
    if (category.includes("core europe")) return "Europa core";
    if (category.includes("emerging")) return "Emergentes";
    return "EUA amplo";
  }

  if (group === "Setoriais") {
    if (["XLK", "XLC", "XLY"].includes(ticker)) return "Growth / comunicação";
    if (["XLF", "XLI", "XLB", "XLE"].includes(ticker)) return "Cíclicos";
    if (["XLV", "XLP", "XLU", "XLRE"].includes(ticker)) return "Defensivos / yield";
    return "Outros setores";
  }

  if (group === "Satélites EUA") {
    if (category.includes("semiconductor") || category.includes("ai")) return "IA / semicondutores";
    if (category.includes("defense") || category.includes("cyber")) return "Segurança / defesa";
    if (category.includes("grid") || category.includes("infrastructure") || category.includes("energy")) return "Infraestrutura / energia";
    if (category.includes("onshoring") || category.includes("reindustrialization")) return "Onshoring / reindustrialização";
    if (category.includes("robot") || category.includes("quantum")) return "Opcionalidade tecnológica";
    return "Economia restrita";
  }

  if (group === "Temas Europeus") {
    if (category.includes("defense")) return "Defesa";
    if (category.includes("luxury")) return "Luxo / China indireta";
    if (category.includes("healthcare")) return "Pharma / healthcare";
    if (category.includes("industrial") || category.includes("electrification")) return "Industriais / eletrificação";
    return "Soberania digital";
  }

  if (group === "China / China+1") {
    if (category.includes("direct") || category.includes("china equity")) return "China direta";
    if (category.includes("china+1")) return "China+1";
    if (category.includes("ex-china")) return "EM ex-China";
    if (category.includes("copper") || category.includes("metals and mining")) return "China indireta";
    return "China indireta";
  }

  if (group === "Hedge") {
    if (category.includes("covered call")) return "Option income";
    if (category.includes("minimum volatility")) return "Redução de beta";
    if (category.includes("vix")) return "Volatilidade";
    if (category.includes("inverse")) return "Hedge direcional";
    if (category.includes("concentration")) return "Desconcentração";
    return "Macro";
  }

  return "Outros";
};

const dataLabSubgroupTone = (subgroup) => {
  const tones = {
    "Liquidez USD": "#42d1b7",
    "Treasuries por duration": "#7fb8ff",
    "TIPS / inflação": "#77d38b",
    "Crédito USD": "#9ea7ff",
    "Core bond global": "#8bc7ff",
    "EUA amplo": "#54b6ff",
    "Growth / Nasdaq": "#6f8cff",
    "Core global desenvolvido": "#3cc7d6",
    "Developed ex-US": "#7ac6ff",
    "Europa core": "#86a8ff",
    "Emergentes": "#4fd6a8",
    "Growth / comunicação": "#5d8cff",
    "Cíclicos": "#4eb7e8",
    "Defensivos / yield": "#55c891",
    "Outros setores": "#9da8b8",
    "IA / semicondutores": "#5d8cff",
    "Segurança / defesa": "#50c7d8",
    "Infraestrutura / energia": "#58c489",
    "Onshoring / reindustrialização": "#7aa7ff",
    "Opcionalidade tecnológica": "#8c7dff",
    "Economia restrita": "#4ec0a8",
    "Defesa": "#54b5d8",
    "Luxo / China indireta": "#c5a35a",
    "Pharma / healthcare": "#5ec08b",
    "Industriais / eletrificação": "#62b6d8",
    "Soberania digital": "#8a9cff",
    "China direta": "#5d8cff",
    "China indireta": "#63c7d2",
    "China+1": "#65bf8b",
    "EM ex-China": "#8aa4ff",
    "Option income": "#7fa8ff",
    "Redução de beta": "#62c2d8",
    "Volatilidade": "#9d8cff",
    "Hedge direcional": "#e08585",
    "Desconcentração": "#6cc4a0",
    "Macro": "#c8a85a",
  };
  return tones[subgroup] || "#7fb8ff";
};

const dataLabMetricsFor = (item) => {
  const assetClass = item?.assetClass || "";
  const category = (item?.category || "").toLowerCase();
  const isMacro = ["commodity", "currency", "inverse_equity"].includes(assetClass);
  const isFixedIncome = assetClass === "fixed_income";
  const isHedge = dataLabGroupFor(item) === "Hedge";
  const baseMetrics = DATA_LAB_METRICS.filter(([key]) => key !== "beta1yVsSp500");
  if (item?.ticker === "ITPE") {
    return baseMetrics;
  }
  if (isFixedIncome) {
    return [...baseMetrics, ["correlation1yVsCash", "Correlação vs Fed Funds"]];
  }
  if (assetClass === "volatility") {
    return baseMetrics;
  }
  if (isMacro || isHedge || category.includes("gold") || category.includes("swiss franc")) {
    return [...baseMetrics, ["correlation1yVsSp500", NASDAQ_BENCHMARK_TICKERS.has(item?.ticker) ? "Correlação vs Nasdaq-100" : "Correlação vs S&P 500"]];
  }
  return DATA_LAB_METRICS;
};

const dataLabBenchmarkLabel = (item) => {
  if (item?.ticker === "ITPE") return "";
  if (item?.assetClass === "fixed_income") return "US Treasury 0-1y Index";
  if (item?.assetClass === "volatility") return "";
  if (NASDAQ_BENCHMARK_TICKERS.has(item?.ticker)) return "Nasdaq-100";
  if (["commodity", "currency", "inverse_equity"].includes(item?.assetClass)) return "S&P 500";
  return "S&P 500";
};

const dataLabReferenceLabel = (item) => {
  if (item?.ticker === "ITPE") return "";
  if (item?.assetClass === "fixed_income") return "Fed Funds";
  if (item?.assetClass === "volatility") return "";
  if (["commodity", "currency", "inverse_equity"].includes(item?.assetClass)) return "Correlação";
  return "Beta";
};

const fmtMetric = (value, suffix = "%") =>
  typeof value === "number" && Number.isFinite(value) ? `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}${suffix}` : "n/d";

const fmtDataLabMetric = (key, value) =>
  key === "beta1yVsSp500"
    ? typeof value === "number" && Number.isFinite(value)
      ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "n/d"
    : key === "correlation1yVsSp500"
    ? typeof value === "number" && Number.isFinite(value)
      ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "n/d"
    : key.toLowerCase().includes("pe")
      ? typeof value === "number" && Number.isFinite(value)
        ? `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}x`
        : "n/d"
    : fmtMetric(value);

const valueAtPath = (object, path) =>
  path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);

function DataLabLineChart({ active }) {
  const rawPoints = active?.performanceChart?.points || [];
  const fixedIncomeBenchmarkKey = rawPoints.some((point) => typeof point.cash === "number") ? "cash" : "sp500";
  const benchmarkKey = active?.ticker === "ITPE" || active?.assetClass === "volatility" ? null : active?.assetClass === "fixed_income" ? fixedIncomeBenchmarkKey : NASDAQ_BENCHMARK_TICKERS.has(active?.ticker) ? "qqq" : "sp500";
  const benchmarkLabel = benchmarkKey ? (active?.assetClass === "fixed_income" && benchmarkKey === "cash" ? "Fed Funds" : benchmarkKey === "qqq" ? "Nasdaq-100" : "S&P 500") : "";
  const hasBenchmark = benchmarkKey ? rawPoints.some((point) => typeof point[benchmarkKey] === "number") : false;
  const points = rawPoints.filter((point) => {
    const hasEtf = typeof point.etf === "number" && Number.isFinite(point.etf);
    if (!hasEtf) return false;
    if (!hasBenchmark) return true;
    return typeof point[benchmarkKey] === "number" && Number.isFinite(point[benchmarkKey]);
  });
  const values = points.flatMap((point) => [point.etf, hasBenchmark ? point[benchmarkKey] : null]).filter((value) => typeof value === "number" && Number.isFinite(value));
  const minValue = Math.floor(Math.min(...values, 95) / 5) * 5;
  const maxValue = Math.ceil(Math.max(...values, 105) / 5) * 5;
  const width = 720;
  const height = 310;
  const pad = { top: 22, right: 24, bottom: 34, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (points.length <= 1 ? 0 : (index / (points.length - 1)) * plotW);
  const y = (value) => pad.top + ((maxValue - value) / Math.max(1, maxValue - minValue)) * plotH;
  const pathFor = (key) =>
    points
      .map((point, index) => {
        const value = point[key];
        if (typeof value !== "number" || !Number.isFinite(value)) return "";
        return `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)} ${y(value).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  const endPoint = points[points.length - 1];
  const yStep = Math.max(5, Math.ceil((maxValue - minValue) / 6 / 5) * 5);
  const yTicks = [];
  for (let tick = minValue; tick <= maxValue; tick += yStep) yTicks.push(tick);
  if (!yTicks.includes(100)) yTicks.push(100);
  yTicks.sort((a, b) => a - b);
  const xTickCount = Math.min(5, points.length);
  const xTicks = Array.from({ length: xTickCount }, (_, index) => Math.round((index / Math.max(1, xTickCount - 1)) * (points.length - 1)));
  const shortDate = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `${month}/${year.slice(2)}`;
  };
  const excessValue = hasBenchmark && endPoint ? endPoint.etf - endPoint[benchmarkKey] : null;
  const excessText = typeof excessValue === "number" && Number.isFinite(excessValue) ? `Excesso: ${fmtMetric(excessValue)} vs ${benchmarkLabel}` : null;

  return React.createElement(
    "article",
    { className: "data-lab-chart data-lab-line-card" },
    React.createElement(
      "div",
      { className: "data-lab-chart-head" },
      React.createElement("h3", null, hasBenchmark ? `Evolução: ${active.ticker || "ETF"} vs ${benchmarkLabel}` : `Evolução: ${active.ticker || "ETF"}`),
      React.createElement(
        "div",
        { className: "data-lab-legend" },
        React.createElement("span", { className: "is-etf" }, active.ticker || "ETF"),
        hasBenchmark ? React.createElement("span", { className: "is-spy" }, benchmarkLabel) : null
      )
    ),
    points.length > 1
      ? React.createElement(
          "svg",
          { className: "data-lab-line-chart", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": hasBenchmark ? `Grafico de ${active.ticker || "ETF"} contra ${benchmarkLabel}` : `Grafico de ${active.ticker || "ETF"}` },
          yTicks.map((tick) =>
            React.createElement(
              "g",
              { key: `y-${tick}` },
              React.createElement("line", { x1: pad.left, x2: width - pad.right, y1: y(tick), y2: y(tick), className: "chart-grid" }),
              React.createElement("text", { x: 8, y: y(tick) + 4, className: "data-lab-axis-label" }, tick)
            )
          ),
          xTicks.map((index) =>
            React.createElement(
              "g",
              { key: `x-${index}` },
              React.createElement("line", { x1: x(index), x2: x(index), y1: pad.top, y2: height - pad.bottom, className: "chart-grid" }),
              React.createElement("text", { x: x(index), y: height - 8, className: `data-lab-date-label ${index === points.length - 1 ? "is-end" : ""}` }, shortDate(points[index].date))
            )
          ),
          React.createElement("path", { d: pathFor("etf"), className: "data-lab-line is-etf" }),
          hasBenchmark ? React.createElement("path", { d: pathFor(benchmarkKey), className: "data-lab-line is-spy" }) : null,
          endPoint ? React.createElement("circle", { cx: x(points.length - 1), cy: y(endPoint.etf), r: 4.5, className: "data-lab-dot is-etf" }) : null,
          hasBenchmark && endPoint[benchmarkKey] ? React.createElement("circle", { cx: x(points.length - 1), cy: y(endPoint[benchmarkKey]), r: 4.5, className: "data-lab-dot is-spy" }) : null,
          endPoint
            ? React.createElement(
                "g",
                { transform: `translate(${pad.left + 8} ${pad.top + 8})` },
                React.createElement("rect", { className: "data-lab-result-card", width: 184, height: hasBenchmark ? 78 : 48, rx: 8 }),
                React.createElement("text", { x: 12, y: 22, className: "data-lab-end-label" }, `${active.ticker}: ${fmtMetric(endPoint.etf - 100)}`),
                hasBenchmark && endPoint[benchmarkKey] ? React.createElement("text", { x: 12, y: 43, className: "data-lab-end-label" }, `${benchmarkLabel}: ${fmtMetric(endPoint[benchmarkKey] - 100)}`) : null,
                excessText ? React.createElement("text", { x: 12, y: 64, className: "data-lab-end-label" }, `Excesso: ${fmtMetric(excessValue)}`) : null
              )
            : null
        )
      : React.createElement("p", { className: "data-note" }, "Série histórica ainda não disponível para este instrumento."),
    React.createElement("p", { className: "data-note" }, "Retorno total aproximado via adjusted close; dados sujeitos a atraso e revisão.")
  );
}

function DataLabModule() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [performanceResult, setPerformanceResult] = useState(null);
  const [fixedIncomeResult, setFixedIncomeResult] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState("IB01");
  const [selectedGroup, setSelectedGroup] = useState("Fixed Income");

  useEffect(() => {
    let cancelled = false;
    DataClient.loadMany(["etf-performance", "fixed-income-performance"])
      .then(([mainResult, fixedResult]) => {
        if (cancelled) return;
        setPerformanceResult(mainResult);
        setFixedIncomeResult(fixedResult);

        if (!mainResult.ok) {
          setError(mainResult.error?.message || "Falha ao carregar o dataset principal.");
          return;
        }

        const fixedByTicker = new Map((fixedResult.ok ? fixedResult.data?.instruments : []).map((item) => [item.ticker, item]));
        const payload = {
          ...mainResult.data,
          instruments: (mainResult.data.instruments || []).map((item) => {
            const replacement = fixedByTicker.get(item.ticker);
            const needsFallback = dataLabGroupFor(item) === "Fixed Income" && (!item.performanceChart?.points?.length || item.status !== "ok");
            if (!needsFallback || !replacement) {
              return {
                ...item,
                dataStatus: item.status || mainResult.meta.status,
                dataSource: item.quoteSource || mainResult.meta.source,
                dataAsOf: item.asOf || mainResult.meta.asOf,
              };
            }
            return {
              ...item,
              ...replacement,
              status: fixedResult.meta.status === "ok" ? "ok" : "stale",
              dataStatus: fixedResult.meta.status,
              dataSource: fixedResult.meta.source,
              dataAsOf: replacement.asOf || fixedResult.meta.asOf,
              fallbackDataset: "fixed-income-performance",
            };
          }),
        };

        setData(payload);
        const firstOk = payload.instruments.find((item) => item.status === "ok" && dataLabGroupFor(item) === "Fixed Income" && item.performanceChart?.points?.length > 1) || payload.instruments.find((item) => item.status === "ok" && item.performanceChart?.points?.length > 1) || payload.instruments?.[0];
        if (firstOk) setSelectedTicker(firstOk.ticker);
      })
    return () => {
      cancelled = true;
    };
  }, []);

  const instruments = data?.instruments || [];
  const filteredInstruments = instruments.filter((item) => dataLabGroupFor(item) === selectedGroup);
  const groupCounts = DATA_LAB_GROUPS.reduce((acc, group) => {
    acc[group] = instruments.filter((item) => dataLabGroupFor(item) === group).length;
    return acc;
  }, {});
  const subgroupMap = filteredInstruments.reduce((acc, item) => {
    const subgroup = dataLabSubgroupFor(item);
    if (!acc[subgroup]) acc[subgroup] = [];
    acc[subgroup].push(item);
    return acc;
  }, {});
  const subgroupOrder = DATA_LAB_SUBGROUP_ORDER[selectedGroup] || [];
  const subgroupEntries = Object.entries(subgroupMap).sort(([a], [b]) => {
    const aIndex = subgroupOrder.indexOf(a);
    const bIndex = subgroupOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  useEffect(() => {
    if (!filteredInstruments.length) return;
    const selectedInGroup = filteredInstruments.find((item) => item.ticker === selectedTicker);
    if (!selectedInGroup || !selectedInGroup.performanceChart?.points?.length) {
      const firstWithChart = filteredInstruments.find((item) => item.performanceChart?.points?.length > 1) || filteredInstruments[0];
      setSelectedTicker(firstWithChart.ticker);
    }
  }, [selectedGroup, data]);

  const active = instruments.find((item) => item.ticker === selectedTicker) || instruments[0];
  const activeBenchmarkLabel = dataLabBenchmarkLabel(active);
  const activeReferenceLabel = dataLabReferenceLabel(active);

  return React.createElement(
    "main",
    { className: "data-lab-layout work-surface" },
    React.createElement(
      "section",
      { className: "panel data-lab-list" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "control-title" }, "Base automatizada"),
          React.createElement("h2", null, "ETFs monitorados")
        ),
        React.createElement("span", { className: "mini-label" }, data?.asOf ? `Atualizado em ${formatDatePtBr(data.asOf)}` : "JSON")
      ),
      React.createElement(
        "div",
        { className: "dataset-status-stack", "aria-label": "Proveniência do Data Lab" },
        React.createElement(DatasetStatusLine, { result: performanceResult, label: "Base principal" }),
        performanceResult?.ok && performanceResult.meta?.status === "ok"
          ? null
          : React.createElement(DatasetStatusLine, { result: fixedIncomeResult, label: "Renda fixa de contingência" })
      ),
      error ? React.createElement("p", { className: "data-note" }, "Dados temporariamente indisponíveis. Tente novamente mais tarde.") : null,
      !data && !error ? React.createElement("p", { className: "data-note" }, "Carregando dados...") : null,
      React.createElement(
        "div",
        { className: "data-lab-filters" },
        DATA_LAB_GROUPS.map((group) =>
          React.createElement(
            "button",
            {
              className: "data-lab-filter",
              type: "button",
              key: group,
              "aria-pressed": selectedGroup === group,
              onClick: () => setSelectedGroup(group),
            },
            `${group} ${groupCounts[group] ? `(${groupCounts[group]})` : ""}`
          )
        )
      ),
      React.createElement(
        "div",
        { className: "data-lab-instruments" },
        subgroupEntries.map(([subgroup, items]) =>
          React.createElement(
            "section",
            { className: "data-lab-subgroup", key: subgroup },
            React.createElement("span", { className: "data-lab-subgroup-title" }, subgroup),
            React.createElement(
              "div",
              { className: "data-lab-chip-grid" },
              items.map((item) =>
                React.createElement(
                  "button",
                  {
                    className: "data-lab-chip",
                    type: "button",
                    key: item.ticker,
                    "data-subgroup-tone": subgroup,
                    style: { "--subgroup-color": dataLabSubgroupTone(subgroup) },
                    "aria-pressed": active.ticker === item.ticker,
                    onClick: () => setSelectedTicker(item.ticker),
                  },
                  React.createElement("strong", null, item.ticker),
                  React.createElement("span", null, item.status === "ok" ? item.category : (DATASET_STATUS_LABELS[item.dataStatus || item.status] || item.status || "indisponível"))
                )
              )
            )
          )
        )
      ),
      React.createElement("p", { className: "data-note" }, data?.methodology || "O dashboard usa os dados fixos enquanto o JSON não carrega.")
    ),
    React.createElement(
      "section",
      { className: "panel data-lab-active" },
      active
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "control-title" }, "Instrumento selecionado"),
              React.createElement("h2", null, active.ticker),
              React.createElement("p", null, active.name || active.category)
            ),
            React.createElement(
              "div",
              { className: "data-lab-badges" },
              React.createElement("span", null, "Veículo", React.createElement("b", null, active.wrapper || "n/d")),
              React.createElement("span", null, "Moeda", React.createElement("b", null, active.currency || "n/d")),
              activeBenchmarkLabel ? React.createElement("span", null, "Benchmark", React.createElement("b", null, activeBenchmarkLabel)) : null,
              activeReferenceLabel ? React.createElement("span", null, "Referência", React.createElement("b", null, activeReferenceLabel)) : null,
              active.performanceChart?.startDate ? React.createElement("span", null, "Histórico", React.createElement("b", null, formatDatePtBr(active.performanceChart.startDate))) : null,
              React.createElement("span", null, "Dados", React.createElement("b", null, active.dataAsOf ? formatDatePtBr(active.dataAsOf) : "n/d")),
              React.createElement("span", null, "Status", React.createElement("b", null, DATASET_STATUS_LABELS[active.dataStatus || active.status] || active.dataStatus || active.status || "n/d"))
            ),
            React.createElement("p", { className: "data-note" }, `Fonte do instrumento: ${active.dataSource || data?.source || "n/d"}.`),
            React.createElement(
              "div",
              { className: "data-lab-metrics" },
              dataLabMetricsFor(active).filter(([key]) => !key.startsWith("correlation") || valueAtPath(active, key) !== undefined).map(([key, label]) =>
                {
                  const metricValue =
                    (active?.ticker === "ITPE" && ["return3yAnnPct", "return5yAnnPct"].includes(key)) ||
                    (active?.ticker === "JEPQ" && key === "return5yAnnPct")
                      ? undefined
                      : valueAtPath(active, key);
                  return React.createElement(
                    "div",
                    { className: "data-lab-metric", key },
                    React.createElement("span", null, renderMetricLabel(label)),
                    React.createElement("strong", null, fmtDataLabMetric(key, metricValue))
                  );
                }
              )
            ),
            React.createElement(
              React.Fragment,
              null,
              React.createElement(DataLabLineChart, { active })
            )
          )
        : React.createElement("p", { className: "data-note" }, "Nenhum instrumento carregado ainda.")
    )
  );
}

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

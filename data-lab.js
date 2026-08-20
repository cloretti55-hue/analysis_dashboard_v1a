(function () {
const { useEffect, useState } = React;
const {
  formatDatePtBr,
  DATASET_STATUS_LABELS,
  DatasetStatusLine,
} = window.GCCommon;

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


window.GCDataLab = {
  DataLabModule,
};
})();

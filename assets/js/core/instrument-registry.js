window.GCInstrumentRegistry = (() => {
const DATA_LAB_METRICS = [
  ["returnYtdPct", "YTD"],
  ["return1yPct", "1 ano"],
  ["return3yAnnPct", "Retorno anualizado 3 anos"],
  ["return5yAnnPct", "Retorno anualizado 5 anos"],
  ["vol1yAnnPct", "Volatilidade anualizada 1 ano"],
  ["maxDrawdown1yPct", "Max Drawdown 1 ano"],
  ["beta1yVsSp500", "Beta 1 ano"],
];

const DATA_LAB_GROUPS = ["Fixed Income", "Core Equities", "Setoriais", "Satélites EUA", "Temas Europeus", "China / China+1", "Hedge"];

const DATA_LAB_SUBGROUP_ORDER = {
  "Fixed Income": ["Liquidez USD", "Treasuries por duration", "TIPS / inflação", "Crédito USD", "Core bond global"],
  "Core Equities": ["EUA amplo", "Growth / Nasdaq", "Core global desenvolvido", "Developed ex-US", "Europa core", "Emergentes"],
  Setoriais: ["Growth / comunicação", "Cíclicos", "Defensivos / yield", "Outros setores"],
  "Satélites EUA": ["IA / semicondutores", "Segurança / defesa", "Infraestrutura / energia", "Onshoring / reindustrialização", "Opcionalidade tecnológica", "Economia restrita"],
  "Temas Europeus": ["Defesa", "Luxo / China indireta", "Pharma / healthcare", "Industriais / eletrificação", "Soberania digital"],
  "China / China+1": ["China direta", "China indireta", "China+1", "EM ex-China"],
  Hedge: ["Option income", "Redução de beta", "Volatilidade", "Hedge direcional", "Desconcentração", "Macro"],
};

const SUBGROUP_TONES = {
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
  Emergentes: "#4fd6a8",
  "Growth / comunicação": "#5d8cff",
  Cíclicos: "#4eb7e8",
  "Defensivos / yield": "#55c891",
  "Outros setores": "#9da8b8",
  "IA / semicondutores": "#5d8cff",
  "Segurança / defesa": "#50c7d8",
  "Infraestrutura / energia": "#58c489",
  "Onshoring / reindustrialização": "#7aa7ff",
  "Opcionalidade tecnológica": "#8c7dff",
  "Economia restrita": "#4ec0a8",
  Defesa: "#54b5d8",
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
  Volatilidade: "#9d8cff",
  "Hedge direcional": "#e08585",
  Desconcentração: "#6cc4a0",
  Macro: "#c8a85a",
};

const categoryOf = (item) => (item?.category || "").toLowerCase();

const rawGroupFor = (item) => {
  const category = categoryOf(item);
  if (category.includes("gics sector")) return "Setoriais";
  if (category.includes("covered call") || category.includes("minimum volatility") || category.includes("vix") || category.includes("inverse") || category.includes("concentration hedge") || category.includes("gold") || category.includes("swiss franc")) return "Hedge";
  if (category.includes("treasuries") || category.includes("treasury bills") || category.includes("inflation usd") || category.includes("credit") || category.includes("high yield") || category.includes("core bond")) return "Fixed Income";
  if (category.includes("china") || category.includes("em ex-china") || category.includes("china+1") || category.includes("asia technology") || category.includes("copper miners") || category.includes("metals and mining")) return "China / China+1";
  if (category.includes("luxury") || category.includes("europe healthcare") || category.includes("global healthcare")) return "Temas Europeus";
  if (category.startsWith("core") || category.includes("s&p 500 benchmark") || category.includes("us growth") || category.includes("nasdaq-100")) return "Core Equities";
  return "Satélites EUA";
};

const groupFor = (item) => item?.registry?.group || rawGroupFor(item);

const rawSubgroupFor = (item) => {
  const category = categoryOf(item);
  const ticker = item?.ticker || "";
  const group = rawGroupFor(item);

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

const subgroupFor = (item) => item?.registry?.subgroup || rawSubgroupFor(item);
const subgroupTone = (subgroup) => SUBGROUP_TONES[subgroup] || "#7fb8ff";

const benchmarkCodeFor = (item) => {
  if (item?.ticker === "ITPE" || item?.assetClass === "volatility") return null;
  if (item?.assetClass === "fixed_income") return "FED_FUNDS";
  return item?.benchmark || "SPY";
};

const benchmarkLabelFor = (item) => {
  if (item?.registry?.benchmark?.display !== undefined) return item.registry.benchmark.display;
  const benchmarkCode = benchmarkCodeFor(item);
  if (!benchmarkCode) return "";
  if (benchmarkCode === "FED_FUNDS") return "US Treasury 0-1y Index";
  if (benchmarkCode === "QQQ") return "Nasdaq-100";
  return "S&P 500";
};

const referenceLabelFor = (item) => {
  if (item?.registry?.referenceLabel !== undefined) return item.registry.referenceLabel;
  if (item?.ticker === "ITPE" || item?.assetClass === "volatility") return "";
  if (item?.assetClass === "fixed_income") return "Fed Funds";
  if (["commodity", "currency", "inverse_equity"].includes(item?.assetClass)) return "Correlação";
  return "Beta";
};

const metricsFor = (item) => {
  const assetClass = item?.assetClass || "";
  const category = categoryOf(item);
  const isMacro = ["commodity", "currency", "inverse_equity"].includes(assetClass);
  const isFixedIncome = assetClass === "fixed_income";
  const isHedge = groupFor(item) === "Hedge";
  const baseMetrics = DATA_LAB_METRICS.filter(([key]) => key !== "beta1yVsSp500");
  if (item?.ticker === "ITPE") return baseMetrics;
  if (isFixedIncome) return [...baseMetrics, ["correlation1yVsCash", "Correlação vs Fed Funds"]];
  if (assetClass === "volatility") return baseMetrics;
  if (isMacro || isHedge || category.includes("gold") || category.includes("swiss franc")) {
    return [...baseMetrics, ["correlation1yVsSp500", benchmarkCodeFor(item) === "QQQ" ? "Correlação vs Nasdaq-100" : "Correlação vs S&P 500"]];
  }
  return DATA_LAB_METRICS;
};

const metricIsSuppressed = (item, key) =>
  (item?.ticker === "ITPE" && ["return3yAnnPct", "return5yAnnPct"].includes(key)) ||
  (item?.ticker === "JEPQ" && key === "return5yAnnPct");

const chartBenchmarkFor = (item, points = []) => {
  const benchmarkCode = benchmarkCodeFor(item);
  if (!benchmarkCode) return { key: null, label: "" };
  if (benchmarkCode === "FED_FUNDS") {
    const key = points.some((point) => typeof point.cash === "number") ? "cash" : "sp500";
    return { key, label: key === "cash" ? "Fed Funds" : "S&P 500" };
  }
  if (benchmarkCode === "QQQ") return { key: "qqq", label: "Nasdaq-100" };
  return { key: "sp500", label: "S&P 500" };
};

const instrumentTypeFor = (item) => {
  if (item?.instrumentType) return item.instrumentType;
  const wrapper = (item?.wrapper || "").toLowerCase();
  if (wrapper.includes("etn")) return "etn";
  if (wrapper.includes("etf")) return "etf";
  if (item?.maturityDate || item?.expiryDate) return "fixed_income_security";
  return item?.assetClass || "instrument";
};

const enrichInstrument = (item, catalogItem = null) => {
  const merged = { ...(catalogItem || {}), ...(item || {}) };
  const group = rawGroupFor(merged);
  const subgroup = rawSubgroupFor(merged);
  const benchmarkCode = benchmarkCodeFor(merged);
  const explicitCapabilities = merged.capabilities || {};
  const capabilities = {
    performance: explicitCapabilities.performance !== false,
    risk: explicitCapabilities.risk !== false,
    comparison: explicitCapabilities.comparison !== false && Boolean(benchmarkCode),
    maturity: explicitCapabilities.maturity === true || Boolean(merged.maturityDate || merged.expiryDate),
    yield: explicitCapabilities.yield === true,
  };

  return {
    ...merged,
    instrumentId: merged.instrumentId || merged.ticker,
    registry: {
      schemaVersion: 1,
      instrumentType: instrumentTypeFor(merged),
      dataFamily: merged.dataFamily || "market_instrument",
      group,
      subgroup,
      subgroupTone: subgroupTone(subgroup),
      benchmark: {
        code: benchmarkCode,
        display: benchmarkLabelFor(merged),
      },
      referenceLabel: referenceLabelFor(merged),
      updateFrequency: merged.updateFrequency || null,
      maturityDate: merged.maturityDate || merged.expiryDate || null,
      capabilities,
    },
  };
};

const createCatalog = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.instruments || [];
  const byTicker = new Map(items.map((item) => [item.ticker, item]));
  return {
    size: byTicker.size,
    get: (ticker) => byTicker.get(ticker) || null,
    enrich: (item) => enrichInstrument(item, byTicker.get(item?.ticker) || null),
  };
};

return {
  DATA_LAB_GROUPS,
  DATA_LAB_SUBGROUP_ORDER,
  createCatalog,
  enrichInstrument,
  groupFor,
  subgroupFor,
  subgroupTone,
  metricsFor,
  metricIsSuppressed,
  benchmarkLabelFor,
  referenceLabelFor,
  chartBenchmarkFor,
};
})();

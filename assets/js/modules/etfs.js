(function () {
const { useEffect, useState } = React;

function scrollToMobileDetail(selector) {
  if (!window.matchMedia("(max-width: 720px)").matches) return;
  window.setTimeout(() => {
    const title = document.querySelector(selector);
    if (!title) return;
    const top = title.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top, behavior: "smooth" });
  }, 60);
}

const CORE_FUNCTIONS = [
  { fn: "Beta estrutural EUA", why: "Baixo custo, replicação eficiente e longo prazo.", tickers: ["VOO", "CSPX", "VUAA"], note: "UCITS Acc pode fazer sentido para offshore não-US quando fiscalmente adequado." },
  { fn: "Execução / hedge EUA", why: "Liquidez, opções e profundidade de mercado.", tickers: ["SPY"], note: "Usado com frequência em puts, collars, overlays e rebalanceamento tático." },
  { fn: "Growth estrutural", why: "Nasdaq-100 com menor custo ou versão UCITS.", tickers: ["QQQM", "CNDX", "EQQQ"], note: "QQQ tende a ser mais ligado à execução; QQQM/UCITS tendem ao carregamento." },
  { fn: "Growth tático / hedge", why: "Opções profundas e liquidez superior.", tickers: ["QQQ"], note: "Instrumento de trading, não necessariamente melhor veículo fiscal." },
  { fn: "Redução de concentração", why: "Reduz dominância das mega caps.", tickers: ["RSP"], note: "Aumenta exposição a cíclicas e risco de juros." },
  { fn: "Core global desenvolvido", why: "MSCI World com peso relevante em EUA.", tickers: ["IWDA", "SWDA"], note: "Serve para simplificar core global, não para reduzir EUA." },
  { fn: "Core developed ex-US", why: "Diversificação desenvolvida fora dos EUA.", tickers: ["VEA", "IEFA"], note: "VEA inclui Canadá; IEFA segue EAFE e exclui EUA/Canadá." },
  { fn: "Core Europa", why: "Exposição regional.", tickers: ["VGK", "IEUR", "FEZ", "IMEU"], note: "ETF amplo não captura bem defesa, luxo e soberania digital." },
  { fn: "Emergentes amplos", why: "Beta EM diversificado.", tickers: ["VWO", "IEMG", "EIMI"], note: "China pode dominar demais o risco." },
  { fn: "Emergentes ex-China", why: "Reduz risco China.", tickers: ["EMXC", "EXCH"], note: "Útil para China+1 e diversificação geopolítica." },
  { fn: "Treasuries USD Acc", why: "Escada de títulos do Tesouro americano por duration.", tickers: ["IB01", "IBTA", "CBU7", "IBTM", "DTLA"], note: "Do caixa remunerado à posição direcional em queda de juros." },
  { fn: "Inflação USD Acc", why: "TIPS com diferentes perfis de duration.", tickers: ["TIP5", "ITPS", "ITPE"], note: "Separa proteção inflacionária curta de inflação ampla." },
  { fn: "Crédito e core bond", why: "Spread corporativo e diversificação global em bonds.", tickers: ["LQDA", "IHYA", "AGGU"], note: "IG, high yield e agregado global cumprem funções distintas." },
  { fn: "Hedge macro", why: "Proteção de regime, moeda forte e reserva de valor.", tickers: ["GLD", "IAU", "FXF / CHF"], note: "Ouro físico e franco suíço como diversificadores macro." },
];

const FIXED_INCOME_TICKERS = new Set(["IB01", "IBTA", "CBU7", "IBTM", "DTLA", "TIP5", "ITPS", "ITPE", "LQDA", "IHYA", "AGGU"]);
const HEDGE_MACRO_TICKERS = new Set(["GLD", "IAU", "FXF / CHF"]);
const FIXED_INCOME_FUNCTIONS = CORE_FUNCTIONS.filter((row) => row.tickers.some((ticker) => FIXED_INCOME_TICKERS.has(ticker)));
const CORE_EQUITY_FUNCTIONS = CORE_FUNCTIONS.filter((row) => !row.tickers.some((ticker) => FIXED_INCOME_TICKERS.has(ticker) || HEDGE_MACRO_TICKERS.has(ticker)));

const CORE_TOKEN_GROUPS = {
  VOO: "etf-us",
  CSPX: "etf-us",
  VUAA: "etf-us",
  SPY: "etf-us",
  QQQM: "etf-us",
  CNDX: "etf-us",
  EQQQ: "etf-us",
  QQQ: "etf-us",
  RSP: "etf-us",
  VEA: "etf-developed",
  IEFA: "etf-developed",
  IWDA: "etf-global",
  SWDA: "etf-global",
  VGK: "etf-developed",
  IEUR: "etf-developed",
  FEZ: "etf-developed",
  IMEU: "etf-developed",
  VWO: "etf-emerging",
  IEMG: "etf-emerging",
  EIMI: "etf-emerging",
  EMXC: "etf-emerging",
  EXCH: "etf-emerging",
  IB01: "etf-fixed",
  IBTA: "etf-fixed",
  CBU7: "etf-fixed",
  IBTM: "etf-fixed",
  DTLA: "etf-fixed",
  TIP5: "etf-fixed",
  ITPS: "etf-fixed",
  ITPE: "etf-fixed",
  LQDA: "etf-fixed",
  IHYA: "etf-fixed",
  AGGU: "etf-fixed",
  GLD: "etf-other",
  IAU: "etf-other",
  "FXF / CHF": "etf-other",
};

const UCITS_TICKERS = new Set([
  "CSPX",
  "VUAA",
  "CNDX",
  "EQQQ",
  "IWDA",
  "SWDA",
  "IMEU",
  "EIMI",
  "EXCH",
  "IB01",
  "IBTA",
  "CBU7",
  "IBTM",
  "DTLA",
  "TIP5",
  "ITPS",
  "ITPE",
  "LQDA",
  "IHYA",
  "AGGU",
]);

const coreTokenClass = (ticker, ucitsView) => {
  const classes = ["etf-token", CORE_TOKEN_GROUPS[ticker] || "etf-other"];
  if (ucitsView === "ucits") {
    classes.push(UCITS_TICKERS.has(ticker) ? "is-ucits-highlight" : "is-muted");
  }
  return classes.join(" ");
};

const CORE_COUNTRY_WEIGHTS = {
  VEA: [
    ["Japão", 21.0],
    ["Reino Unido", 12.0],
    ["Canadá", 9.0],
    ["França", 8.0],
    ["Suíça", 7.5],
    ["Alemanha", 7.0],
  ],
  IEFA: [
    ["Japão", 25.7],
    ["Reino Unido", 13.9],
    ["França", 9.0],
    ["Suíça", 8.7],
    ["Alemanha", 8.0],
    ["Austrália", 7.1],
  ],
  IWDA: [
    ["EUA", 72.0],
    ["Japão", 5.5],
    ["Reino Unido", 3.5],
    ["Canadá", 3.0],
    ["França", 2.8],
    ["Suíça", 2.6],
  ],
  SWDA: [
    ["EUA", 72.0],
    ["Japão", 5.5],
    ["Reino Unido", 3.5],
    ["Canadá", 3.0],
    ["França", 2.8],
    ["Suíça", 2.6],
  ],
  VGK: [
    ["Reino Unido", 23.0],
    ["França", 17.0],
    ["Suíça", 15.0],
    ["Alemanha", 13.0],
    ["Holanda", 7.0],
    ["Suécia", 6.0],
  ],
  IEUR: [
    ["Reino Unido", 21.5],
    ["França", 18.2],
    ["Suíça", 16.5],
    ["Alemanha", 13.6],
    ["Holanda", 7.3],
    ["Dinamarca", 5.4],
  ],
  FEZ: [
    ["França", 34.0],
    ["Alemanha", 31.0],
    ["Holanda", 14.0],
    ["Espanha", 8.0],
    ["Itália", 7.0],
    ["Bélgica", 3.0],
  ],
  IMEU: [
    ["Reino Unido", 22.0],
    ["França", 18.0],
    ["Suíça", 16.2],
    ["Alemanha", 13.8],
    ["Holanda", 7.2],
    ["Dinamarca", 5.1],
  ],
  VWO: [
    ["Taiwan", 29.0],
    ["China", 29.0],
    ["Índia", 19.0],
    ["Brasil", 4.0],
    ["Arábia Saudita", 3.0],
    ["África do Sul", 3.0],
  ],
  IEMG: [
    ["Taiwan", 28.1],
    ["Coreia do Sul", 21.7],
    ["China", 17.9],
    ["Índia", 12.2],
    ["Brasil", 3.7],
    ["África do Sul", 3.0],
  ],
  EIMI: [
    ["Taiwan", 28.0],
    ["Coreia do Sul", 21.5],
    ["China", 18.0],
    ["Índia", 12.0],
    ["Brasil", 3.7],
    ["África do Sul", 3.0],
  ],
  EMXC: [
    ["Taiwan", 34.6],
    ["Coreia do Sul", 28.2],
    ["Índia", 13.6],
    ["Brasil", 4.6],
    ["África do Sul", 3.6],
    ["Arábia Saudita", 3.0],
  ],
  EXCH: [
    ["Taiwan", 34.5],
    ["Coreia do Sul", 28.0],
    ["Índia", 13.5],
    ["Brasil", 4.5],
    ["África do Sul", 3.5],
    ["Arábia Saudita", 3.0],
  ],
};

const CORE_DETAILS = {
  VOO: ["Beta estrutural EUA", "Carregar S&P 500 com baixo custo.", "Não é o melhor instrumento para hedge com opções.", ["Veículo eficiente para buy and hold.", "Boa escolha quando fiscalidade US-listed é aceitável.", "Menos vocacionado a overlays táticos do que SPY."]],
  CSPX: ["Beta estrutural EUA", "S&P 500 UCITS acumulador.", "Menos útil para execução tática e opções.", ["Apropriado para muitas carteiras offshore não-US.", "Accumulating reduz distribuição de caixa.", "Veículo de carregamento, não de trading."]],
  VUAA: ["Beta estrutural EUA", "S&P 500 UCITS Acc com custo competitivo.", "Menor profundidade tática que SPY.", ["Bom para reinvestimento automático.", "Útil quando domicílio UCITS importa.", "Função principal: core estrutural."]],
  SPY: ["Execução / hedge EUA", "Liquidez, opções e execução tática.", "Pode não ser o veículo mais eficiente para carregar patrimônio offshore.", ["Excelente para puts, collars e overlays.", "Profundidade de mercado reduz fricção.", "Instrumento de operação, não necessariamente de carregamento fiscal."]],
  QQQ: ["Growth tático / hedge", "Execução e opções em Nasdaq-100.", "Buy and hold pode pedir outro veículo.", ["Alta liquidez intradiária.", "Opções profundas.", "Concentração em growth e tecnologia é parte da tese."]],
  QQQM: ["Growth estrutural", "Carregar Nasdaq-100 com custo menor.", "Menos ideal para trading pesado que QQQ.", ["Melhor vocação para posição estrutural.", "Mantém exposição growth concentrada.", "Diferença de veículo importa no horizonte longo."]],
  CNDX: ["Growth estrutural", "Nasdaq-100 UCITS Acc.", "Não substitui QQQ em liquidez/opções.", ["Útil para offshore não-US.", "Acumulação facilita reinvestimento.", "Exposição growth com wrapper UCITS."]],
  EQQQ: ["Growth estrutural", "Nasdaq-100 em formato UCITS.", "Verificar distribuição, custo e moeda de negociação.", ["Alternativa europeia para Nasdaq-100.", "Boa para separar exposição de veículo.", "Comparar com CNDX conforme domicílio e política de distribuição."]],
  RSP: ["Redução de concentração", "Equal weight no S&P 500.", "Não é automaticamente melhor; muda fatores de risco.", ["Reduz peso da Magnificent 7.", "Aumenta sensibilidade a mid/large cíclicas.", "Pode sofrer mais com juros e ciclo doméstico."]],
  VEA: ["Core developed ex-US", "Mercados desenvolvidos fora dos EUA.", "Pode diluir qualidade/crescimento versus EUA.", ["Diversificação geográfica ampla.", "Exposição a Europa, Japão e Pacífico.", "Ver overlap com ETFs regionais."]],
  IEFA: ["Core developed ex-US", "Developed ex-US amplo.", "Não resolve sozinho a composição setorial desejada.", ["Alternativa ampla para mercados desenvolvidos.", "Boa peça de core internacional.", "Checar tracking, custo e domicílio."]],
  IWDA: ["Core global desenvolvido", "MSCI World UCITS.", "Inclui EUA; pode sobrepor com S&P 500.", ["Veículo UCITS amplo.", "Útil para simplificar core global.", "Checar overlap com VOO/CSPX/VUAA."]],
  SWDA: ["Core global desenvolvido", "MSCI World UCITS Acc.", "Não é ex-US; EUA domina o índice.", ["Acumulação e ampla diversificação.", "Bom para carteira offshore simples.", "Requer controle de concentração EUA."]],
  VGK: ["Core Europa", "Beta europeu amplo.", "Europa ampla pode esconder teses setoriais distintas.", ["Exposição regional direta.", "Útil para rebalancear geografia.", "Não captura perfeitamente luxo, defesa e soberania digital."]],
  IEUR: ["Core Europa", "Europa ampla com veículo iShares.", "Avaliar custo, domicílio e liquidez.", ["Peça regional para developed markets.", "Pode complementar core global.", "Checar sobreposição com VEA/IEFA."]],
  FEZ: ["Core Europa", "Euro Stoxx 50.", "Mais concentrado que Europa ampla.", ["Exposição blue chips da zona do euro.", "Mais concentrado em grandes nomes.", "Não substitui Europa ampla."]],
  IMEU: ["Core Europa", "Europa via UCITS.", "Checar benchmark e política de distribuição.", ["Ferramenta regional para offshore.", "Útil para controle de domicílio.", "Comparar com VGK/IEUR/FEZ."]],
  VWO: ["Emergentes amplos", "Beta emergente diversificado.", "China pode dominar o risco.", ["Exposição ampla a EM.", "Custo competitivo.", "Risco geopolítico e China precisam ser conscientes."]],
  IEMG: ["Emergentes amplos", "EM amplo com grande liquidez.", "Não neutraliza China por si só.", ["Inclui large, mid e small em EM.", "Boa peça de beta emergente.", "Avaliar composição regional."]],
  EIMI: ["Emergentes amplos", "EM UCITS amplo.", "Risco China e tracking devem ser monitorados.", ["Útil para offshore UCITS.", "Diversificação EM ampla.", "Checar Acc/Dist e moeda."]],
  EMXC: ["Emergentes ex-China", "Tese China+1 e redução de risco China.", "Não representa o beta EM tradicional completo.", ["Remove o principal risco geopolítico do EM amplo.", "Aumenta peso relativo de Índia, Taiwan e outros.", "Útil como complemento."]],
  EXCH: ["Emergentes ex-China", "EM ex-China em wrapper UCITS.", "Checar liquidez e tracking.", ["Separação geopolítica do beta EM.", "Útil para carteiras offshore.", "Complementa VWO/IEMG/EIMI."]],
  IB01: ["Liquidez USD", "iShares $ Treasury Bond 0-1yr UCITS ETF USD Acc.", "Caixa remunerado em dólar, não aposta de duration.", ["Serve como liquidez remunerada.", "Baixa volatilidade e baixa sensibilidade a juros.", "Bom veículo Acc quando o objetivo é reinvestimento offshore."]],
  IBTA: ["Duration curta", "iShares $ Treasury Bond 1-3yr UCITS ETF USD Acc.", "Baixa sensibilidade a juros.", ["Adiciona um pouco mais de duration que caixa.", "Útil para carregar yield sem alongar demais.", "Funciona como primeiro degrau depois de liquidez."]],
  CBU7: ["Duration média curta", "iShares $ Treasury Bond 3-7yr UCITS ETF USD Acc.", "Miolo curto da curva.", ["Equilibra carrego e risco de duration.", "Pode capturar cortes moderados sem ir para a ponta longa.", "Boa peça intermediária em escada de Treasuries."]],
  IBTM: ["Duration média", "iShares $ Treasury Bond 7-10yr UCITS ETF USD Acc.", "Hedge parcial contra queda de juros.", ["Mais sensível ao ciclo de política monetária.", "Pode ajudar quando a tese pede queda de juros.", "Exige mais convicção do que os vértices curtos."]],
  DTLA: ["Duration longa", "iShares $ Treasury Bond 20+yr UCITS ETF USD Acc.", "Posição direcional em queda de juros.", ["Alta sensibilidade a juros longos.", "Potencial de ganho maior se yields comprimirem.", "Volatilidade relevante; não é simples caixa remunerado."]],
  TIP5: ["Inflação curta", "iShares $ TIPS 0-5 UCITS ETF USD Acc.", "Proteção inflacionária com duration menor.", ["Combina juro real positivo com menor duration.", "Mais alinhado a carrego real do que a aposta em juros longos.", "Evita misturar inflação com duration excessiva."]],
  ITPS: ["Inflação ampla", "iShares $ TIPS UCITS ETF Acc.", "Inflação americana com mais duration.", ["Oferece exposição à inflação realizada em uma cesta mais ampla.", "Traz mais sensibilidade a juros reais.", "Pode compor carteiras que aceitam mais duration."]],
  ITPE: ["Inflação ampla", "iShares $ TIPS UCITS ETF Acc.", "Inflação americana com mais duration.", ["Alternativa para exposição ampla a TIPS.", "A escolha final depende da bolsa/listagem e política operacional.", "Comparar custo, tracking e moeda de negociação."]],
  LQDA: ["Crédito IG USD", "iShares $ Corp Bond UCITS ETF USD Acc.", "Spread corporativo investment grade.", ["Adiciona prêmio de crédito com qualidade maior.", "Não substitui Treasury como hedge de crise.", "Sensível a spread, duration e ciclo corporativo."]],
  IHYA: ["High Yield USD", "iShares $ High Yield Corp Bond UCITS ETF USD Acc.", "Crédito mais arriscado e yield maior.", ["Carrega mais spread e mais risco de default.", "Tende a se comportar melhor quando crédito e ciclo estão construtivos.", "Não costuma ser tratado como renda fixa defensiva."]],
  AGGU: ["Core bond global", "iShares Core Global Aggregate Bond UCITS ETF USD Acc.", "Diversificação global em bonds.", ["Combina governos e crédito global.", "Pode funcionar como peça ampla de renda fixa.", "Hedge cambial, duration e composição mudam a leitura como core."]],
  GLD: ["Hedge macro", "SPDR Gold Shares.", "ETF de ouro físico com alta liquidez.", ["Funciona como ativo real/monetário.", "Ajuda em choques de confiança e regimes adversos.", "Mais usado quando liquidez e profundidade importam."]],
  IAU: ["Hedge macro", "iShares Gold Trust.", "ETF de ouro físico com custo competitivo.", ["Alternativa eficiente para carregar exposição a ouro.", "Útil como diversificador macro de longo prazo.", "Menor foco em trading pesado do que GLD."]],
  "FXF / CHF": ["Hedge macro", "Invesco CurrencyShares Swiss Franc Trust.", "Exposição ao franco suíço contra o dólar.", ["Refúgio histórico em choques de confiança.", "Baixo carrego, liquidez menor que grandes ETFs e risco de intervenção do SNB.", "Dólar é o hedge natural contra Brasil. Franco suíço é hedge de qualidade monetária. Ouro é hedge de regime."]],
};

const SATELLITE_FILTERS = {
  zone: [
    ["all", "Todos"],
    ["resolve", "ETF resolve"],
    ["partial", "ETF parcial"],
    ["basket", "Precisa cesta"],
  ],
  aggression: [
    ["all", "Todos"],
    ["high", "Alta convexidade"],
    ["medium", "Convexidade média"],
    ["defensive", "Defensivo"],
  ],
  motor: [
    ["all", "Todos"],
    ["ai", "IA hardware"],
    ["energy", "Energia & grid"],
    ["defense", "Defesa"],
    ["cyber", "Cyber"],
    ["industry", "Reindustrialização"],
    ["housing", "Moradia"],
    ["demography", "Demografia"],
  ],
  vehicle: [
    ["all", "Todos"],
    ["etf", "ETF"],
    ["hybrid", "ETF + cesta"],
    ["basket", "Cesta"],
  ],
};

const SATELLITES = [
  {
    theme: "Semicondutores / IA hardware",
    icon: "chip",
    zone: "resolve",
    aggression: "high",
    motor: "ai",
    vehicle: "hybrid",
    etfs: "SMH / SOXX",
    quality: "Alta",
    implementation: "ETF + cesta",
    reading: "Captura o gargalo central da IA, mas carrega alta sensibilidade ao ciclo de CAPEX.",
    names: ["Nvidia", "TSMC", "Broadcom", "ASML", "AMD"],
    extraTitle: "Empresas estratégicas fora do ETF",
    extraCompanies: [
      "Samsung Electronics: memória HBM, DRAM e NAND.",
      "SK Hynix: líder em HBM para IA.",
      "Tokyo Electron: equipamentos para fabricação de chips.",
      "Advantest: testes de chips avançados.",
    ],
    points: ["ETF captura bem a cadeia de valor.", "Valuation e ciclo de semicondutores precisam ser monitorados.", "Boa primeira camada para exposição à infraestrutura de IA."],
  },
  {
    theme: "Defesa EUA",
    icon: "shield",
    zone: "resolve",
    aggression: "medium",
    motor: "defense",
    vehicle: "etf",
    etfs: "ITA / PPA",
    quality: "Alta",
    implementation: "ETF",
    reading: "Geopolítica, orçamento público e tecnologia dual-use sustentam demanda estrutural.",
    names: ["Lockheed Martin", "RTX", "Northrop Grumman", "General Dynamics"],
    points: ["ETF representa bem as grandes contratadas americanas.", "Demanda estatal reduz dependência do consumidor.", "Mistura defesa tradicional, ciber e tecnologia militar."],
  },
  {
    theme: "Cybersecurity",
    icon: "network",
    zone: "resolve",
    aggression: "medium",
    motor: "cyber",
    vehicle: "etf",
    etfs: "CIBR / HACK",
    quality: "Média/alta",
    implementation: "ETF",
    reading: "Demanda estrutural, recorrente e menos dependente de CAPEX físico.",
    names: ["Palo Alto", "CrowdStrike", "Fortinet", "Zscaler"],
    points: ["ETF representa o tema, mas a composição merece acompanhamento.", "Tema recorrente dentro de segurança digital.", "Menos binário do que quantum ou data centers físicos."],
  },
  {
    theme: "Robotics / automação",
    icon: "robotics",
    zone: "partial",
    aggression: "high",
    motor: "industry",
    vehicle: "hybrid",
    etfs: "BOTZ / ROBO",
    quality: "Média",
    implementation: "ETF + cesta",
    reading: "Tema forte, mas os ETFs misturam empresas com motores econômicos diferentes.",
    names: ["Rockwell", "ABB", "Fanuc", "Teradyne"],
    points: ["ETF ajuda como camada inicial.", "Cesta melhora precisão da tese.", "Automação industrial é subtema relevante de reindustrialização."],
  },
  {
    theme: "Energia / grid",
    icon: "energy",
    zone: "partial",
    aggression: "medium",
    motor: "energy",
    vehicle: "hybrid",
    etfs: "XLE / GRID / PAVE / XLU",
    quality: "Parcial",
    implementation: "ETF + cesta",
    reading: "A tese é eletrificação, transmissão e equipamentos, não apenas energia tradicional.",
    names: ["Eaton", "Hubbell", "Quanta Services", "Constellation", "NextEra"],
    points: ["ETF amplo dilui o motor econômico.", "Cesta separa utilities, equipamentos e engenharia.", "Data centers tornam o grid uma restrição estratégica."],
  },
  {
    theme: "Infrastructure / utilities",
    icon: "grid",
    zone: "partial",
    aggression: "defensive",
    motor: "energy",
    vehicle: "hybrid",
    etfs: "XLU / PAVE / GRID",
    quality: "Média",
    implementation: "ETF + cesta",
    reading: "Exposição mais defensiva, ligada a CAPEX físico, regulação e demanda elétrica.",
    names: ["Duke Energy", "Southern Company", "NextEra", "Quanta Services"],
    points: ["Pode estabilizar a carteira.", "Risco de duration precisa ser monitorado.", "ETF amplo mistura perfil defensivo com sensibilidade a juros."],
  },
  {
    theme: "Construção residencial",
    icon: "home",
    zone: "resolve",
    aggression: "medium",
    motor: "housing",
    vehicle: "etf",
    etfs: "ITB / XHB",
    quality: "Alta",
    implementation: "ETF",
    reading: "Escassez estrutural de moradias, terrenos e capacidade de construção.",
    names: ["D.R. Horton", "Lennar", "PulteGroup", "NVR"],
    points: ["Demanda habitacional é estrutural, mas sensível a juros.", "ETF ajuda a capturar o ciclo de homebuilders.", "A tese melhora quando a oferta nova segue restrita."],
  },
  {
    theme: "Materiais e infraestrutura da construção",
    icon: "factory",
    zone: "resolve",
    aggression: "medium",
    motor: "housing",
    vehicle: "etf",
    etfs: "PKB",
    quality: "Média/alta",
    implementation: "ETF",
    reading: "Fornecedores críticos da cadeia habitacional e de infraestrutura.",
    names: ["Builders FirstSource", "Vulcan Materials", "Martin Marietta", "Masco"],
    points: ["Captura a cadeia de construção além dos homebuilders.", "Mistura moradia, infraestrutura e materiais.", "Sensível a ciclo, mas apoiada por necessidade física."],
  },
  {
    theme: "Cuidados com idosos",
    icon: "home",
    zone: "basket",
    aggression: "defensive",
    motor: "demography",
    vehicle: "basket",
    etfs: "Sem ETF puro",
    quality: "Baixa",
    implementation: "Cesta",
    reading: "Envelhecimento aumenta demanda por residências assistidas, enfermagem e serviços de longo prazo.",
    names: ["Brookdale Senior Living", "The Ensign Group", "Option Care Health"],
    points: ["Demografia cria vento estrutural.", "Oferta cresce devagar por mão de obra e regulação.", "Cesta pequena evita ETF genérico demais."],
  },
  {
    theme: "Distribuição farmacêutica",
    icon: "pulse",
    zone: "basket",
    aggression: "defensive",
    motor: "demography",
    vehicle: "basket",
    etfs: "Sem ETF limpo",
    quality: "Baixa",
    implementation: "Cesta de ações",
    reading: "Mercado altamente concentrado, responsável pela distribuição da maior parte dos medicamentos nos Estados Unidos.",
    names: ["McKesson", "Cencora", "Cardinal Health"],
    points: ["Receitas recorrentes, escala operacional elevada e barreiras logísticas.", "Demanda estrutural impulsionada por envelhecimento populacional e maior consumo de medicamentos.", "Riscos: margens reduzidas, pressão regulatória, mudanças no sistema de reembolso e concentração de clientes."],
  },
  {
    theme: "Data centers físicos",
    icon: "server",
    zone: "basket",
    aggression: "high",
    motor: "ai",
    vehicle: "basket",
    etfs: "SRVR / VPN / proxies",
    quality: "Baixa",
    implementation: "Cesta",
    reading: "ETFs ainda capturam mal energia, cooling, equipamentos e networking.",
    names: ["Vertiv", "Eaton", "Schneider", "Equinix", "Digital Realty", "Arista", "Broadcom"],
    points: ["Tema físico e fragmentado.", "REITs e proxies não capturam a cadeia completa.", "Aqui a cesta vira necessidade de implementação."],
  },
  {
    theme: "Onshoring / reindustrialização",
    icon: "factory",
    zone: "basket",
    aggression: "medium",
    motor: "industry",
    vehicle: "basket",
    etfs: "XLI / AIRR",
    quality: "Parcial",
    implementation: "Cesta",
    reading: "ETF industrial amplo dilui a tese de reindustrialização.",
    names: ["Rockwell", "Emerson", "Honeywell", "Caterpillar", "Nucor", "Union Pacific"],
    points: ["Exige separar automação, transporte, aço e bens de capital.", "ETF amplo tende a olhar indústria passada, não necessariamente CAPEX futuro.", "Cesta melhora aderência à tese."],
  },
  {
    theme: "Quantum / frontier computing",
    icon: "atom",
    zone: "basket",
    aggression: "high",
    motor: "ai",
    vehicle: "basket",
    etfs: "QTUM / cestas",
    quality: "Baixa/média",
    implementation: "Cesta pequena",
    reading: "Opcionalidade alta, baixa previsibilidade e dispersão extrema de resultados.",
    names: ["IBM", "IonQ", "Rigetti", "D-Wave", "Microsoft"],
    points: ["A exposição inicial costuma ser tratada com parcimônia.", "O tema ainda está escolhendo vencedores.", "ETF pode misturar empresas pouco expostas ao motor real."],
  },
];

function SatelliteIcon({ type }) {
  const iconProps = { viewBox: "0 0 24 24", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const path = (d) => React.createElement("path", { d, key: d });
  const line = (x1, y1, x2, y2) => React.createElement("line", { x1, y1, x2, y2, key: `${x1}-${y1}-${x2}-${y2}` });
  const circle = (cx, cy, r) => React.createElement("circle", { cx, cy, r, key: `${cx}-${cy}-${r}` });
  const rect = (x, y, width, height, rx = 2) => React.createElement("rect", { x, y, width, height, rx, key: `${x}-${y}-${width}-${height}` });

  const shapes = {
    chip: [
      rect(7, 7, 10, 10, 2),
      line(4, 9, 7, 9),
      line(4, 15, 7, 15),
      line(17, 9, 20, 9),
      line(17, 15, 20, 15),
      line(9, 4, 9, 7),
      line(15, 4, 15, 7),
      line(9, 17, 9, 20),
      line(15, 17, 15, 20),
    ],
    shield: [path("M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"), path("M9 12l2 2 4-5")],
    network: [circle(7, 8, 2), circle(17, 8, 2), circle(12, 17, 2), line(9, 9, 15, 9), line(8, 10, 11, 15), line(16, 10, 13, 15)],
    phone: [rect(8, 3, 8, 18, 2), line(10, 6, 14, 6), circle(12, 18, 0.7), path("M18 8c1.5 2.5 1.5 5.5 0 8"), path("M6 8c-1.5 2.5-1.5 5.5 0 8")],
    robotics: [path("M5 18h8"), path("M8 18v-5l4-4 3 3-4 4"), circle(16, 7, 2), path("M14 19l4-4"), path("M18 15l2 2")],
    energy: [path("M13 2L5 14h6l-1 8 8-12h-6l1-8z")],
    oil: [path("M5 20h14"), path("M8 20V8l4-4 4 4v12"), path("M8 10h8"), path("M10 20v-7h4v7"), path("M16 9l4 2v5"), circle(20, 17, 1.3)],
    grid: [path("M12 3l7 18H5l7-18z"), line(8, 13, 16, 13), line(9.5, 17, 14.5, 17), line(12, 3, 12, 21)],
    faucet: [path("M9 6h8a3 3 0 013 3v1"), path("M4 10h13"), path("M7 10v7"), path("M5 17h4"), path("M15 10v3"), path("M17 16c0 1.2-.8 2-2 2s-2-.8-2-2c0-1.4 2-3.5 2-3.5s2 2.1 2 3.5z"), path("M10 6V4h4v2")],
    server: [rect(5, 5, 14, 5, 1), rect(5, 14, 14, 5, 1), circle(8, 7.5, 0.7), circle(8, 16.5, 0.7), line(11, 7.5, 16, 7.5), line(11, 16.5, 16, 16.5)],
    factory: [path("M4 20V9l5 3V9l5 3V5h6v15H4z"), line(7, 16, 7, 16), line(11, 16, 11, 16), line(15, 16, 15, 16)],
    home: [path("M4 11l8-7 8 7"), path("M6 10v10h12V10"), path("M10 20v-6h4v6")],
    book: [path("M5 5.5A3.5 3.5 0 018.5 2H20v17H8.5A3.5 3.5 0 005 22V5.5z"), path("M5 5.5A3.5 3.5 0 018.5 9H20")],
    diamond: [path("M6 4h12l3 5-9 11L3 9l3-5z"), path("M3 9h18"), path("M8 4l4 16 4-16")],
    money: [rect(4, 6, 16, 12, 2), circle(12, 12, 3), path("M8 9h.01"), path("M16 15h.01"), path("M12 9v6"), path("M10.5 10.5c.6-.7 2.4-.7 3 0"), path("M10.5 13.5c.6.7 2.4.7 3 0")],
    pulse: [path("M20 12h-4l-2 5-4-10-2 5H4"), path("M12 21C7 17.5 4 14.5 4 10a4 4 0 017-2.6A4 4 0 0118 10c0 4.5-3 7.5-6 11z")],
    atom: [circle(12, 12, 1.5), React.createElement("ellipse", { cx: 12, cy: 12, rx: 8, ry: 3.2, key: "e1" }), React.createElement("ellipse", { cx: 12, cy: 12, rx: 8, ry: 3.2, transform: "rotate(60 12 12)", key: "e2" }), React.createElement("ellipse", { cx: 12, cy: 12, rx: 8, ry: 3.2, transform: "rotate(120 12 12)", key: "e3" })],
  };

  return React.createElement("span", { className: "satellite-icon" }, React.createElement("svg", iconProps, shapes[type] || shapes.chip));
}

function SatelliteModule() {
  const riskOrder = { high: 0, medium: 1, defensive: 2 };
  const [filters, setFilters] = useState({ aggression: "all", motor: "all" });
  const [selectedTheme, setSelectedTheme] = useState("Semicondutores / IA hardware");
  const filtered = SATELLITES.filter((item) =>
    Object.entries(filters).every(([key, value]) => value === "all" || item[key] === value)
  ).sort((a, b) => riskOrder[a.aggression] - riskOrder[b.aggression] || a.theme.localeCompare(b.theme, "pt-BR"));
  const active = filtered.find((item) => item.theme === selectedTheme) || filtered[0] || SATELLITES[0];

  const filterRow = (key, label, extraClass = "") =>
    React.createElement(
      "div",
      { className: `filter-row ${extraClass}`.trim(), key },
      React.createElement("span", { className: "filter-label" }, label),
      SATELLITE_FILTERS[key].map(([value, text]) =>
        React.createElement(
          "button",
          {
            className: "filter-chip",
            type: "button",
            key: value,
            "aria-pressed": filters[key] === value,
            onClick: () => setFilters({ ...filters, [key]: value }),
          },
          text
        )
      )
    );

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement("div", { className: "section-head" }, React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Satélites temáticos"))),
      React.createElement(
        "div",
        { className: "satellite-filters" },
        filterRow("aggression", "Convexidade"),
        filterRow("motor", "Motor", "satellite-mobile-hide"),
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "Alta convexidade"),
          React.createElement("span", { className: "sat-risk-medium" }, "Convexidade média"),
          React.createElement("span", { className: "sat-risk-defensive" }, "Defensivo")
        )
      ),
      React.createElement(
        "div",
        { className: "satellite-grid" },
        filtered.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card sat-risk-${item.aggression}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme)),
              React.createElement("p", null, item.reading)
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Tema selecionado"),
      React.createElement("div", { className: `satellite-detail-head sat-risk-${active.aggression}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "ETF possível"), React.createElement("strong", null, active.etfs)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Alternativa"), React.createElement("strong", null, active.implementation)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Qualidade do ETF"), React.createElement("strong", null, active.quality))
      ),
      React.createElement("p", null, active.reading),
      React.createElement("ul", { className: "satellite-list" }, active.points.map((point) => React.createElement("li", { key: point }, point))),
      active.extraCompanies
        ? React.createElement(
            "div",
            { className: "detail-box proxy-box" },
            React.createElement("span", null, active.extraTitle),
            React.createElement("ul", { className: "satellite-list" }, active.extraCompanies.map((point) => React.createElement("li", { key: point }, point)))
          )
        : null,
      React.createElement("div", { className: "detail-box proxy-box" }, React.createElement("span", null, "Exemplos"), React.createElement("strong", null, active.names.join(" · "))),
      React.createElement("p", { className: "data-note" }, "Base: exemplos e proxies setoriais, junho/2026. Lista não exaustiva.")
    )
  );
}
const EUROPE_THEMES = [
  {
    theme: "Defesa europeia",
    icon: "shield",
    status: "Não",
    quality: "Não há ETF",
    tone: "sat-risk-high",
    implementation: "Cesta",
    etfs: "ETF amplo europeu dilui a tese",
    tag: "Sem ETF limpo",
    why: "Rearmamento, OTAN e soberania militar.",
    thesis: "Novo ciclo de gasto militar europeu. A exposição é fragmentada por países e campeões nacionais.",
    names: ["Rheinmetall", "BAE Systems", "Leonardo", "Saab", "Thales", "Dassault Aviation", "Airbus", "Safran", "Rolls-Royce", "Hensoldt", "Kongsberg", "Indra"],
    points: ["Gasto militar virou prioridade.", "ETF amplo dilui defesa.", "Cesta captura campeões nacionais."],
  },
  {
    theme: "Soberania digital",
    icon: "network",
    status: "Não",
    quality: "Não há ETF",
    tone: "sat-risk-high",
    implementation: "Cesta",
    etfs: "Sem ETF limpo para a tese",
    tag: "Sem ETF limpo",
    why: "Cloud local, telecom, software, cyber e dados.",
    thesis: "A Europa não tem um hyperscaler dominante. A tese é uma arquitetura regulada de infraestrutura, software e segurança.",
    names: ["SAP", "OVHcloud", "Deutsche Telekom", "Orange", "Telefónica", "Capgemini", "Dassault Systèmes", "Sopra Steria", "Thales", "Schneider", "Siemens", "Legrand"],
    points: ["Mais controle de dados do que crescimento explosivo.", "Regulação sustenta demanda.", "Cesta evita depender de um único nome."],
  },
  {
    theme: "Luxo / China indireta",
    icon: "diamond",
    status: "Parcial",
    quality: "ETF parcial",
    tone: "sat-risk-medium",
    implementation: "Cesta",
    etfs: "LUXU / GLUX (UCITS) como exposição simples; LUXY como alternativa US-listed",
    tag: "LUXU / GLUX",
    why: "Pricing power e consumidor asiático indireto.",
    thesis: "Luxo europeu combina marca, escassez e margem global. ETF existe, mas a tese fica mais limpa em marcas específicas.",
    names: ["LVMH", "Hermès", "Ferrari", "Richemont", "Moncler", "Prada", "Kering", "L’Oréal", "EssilorLuxottica", "Pernod Ricard"],
    points: ["LUXU/GLUX dão exposição simples.", "ETF compra o setor; cesta compra marcas escassas.", "Cesta separa líderes de marcas frágeis."],
  },
  {
    theme: "Pharma / healthcare",
    icon: "pulse",
    status: "Parcial",
    quality: "ETF parcial",
    tone: "sat-risk-defensive",
    implementation: "Cesta ou ETF setorial",
    etfs: "EXV4 / XDWH / healthcare global como primeira camada; cesta melhora precisão",
    tag: "EXV4 / XDWH",
    why: "Defensividade, inovação e receita global.",
    thesis: "Pharma europeia combina pesquisa, escala global e menor dependência do ciclo econômico.",
    names: ["Novo Nordisk", "Roche", "Novartis", "AstraZeneca", "Sanofi", "GSK", "Merck KGaA", "Lonza", "Genmab", "UCB"],
    points: ["Receita global.", "Menor ciclicidade.", "Qualidade defensiva."],
  },
  {
    theme: "Eletrificação / industriais",
    icon: "energy",
    status: "Parcial",
    quality: "ETF parcial",
    tone: "sat-risk-high",
    implementation: "Cesta",
    etfs: "GRID / PAVE / ETF industrial europeu como primeira camada",
    tag: "GRID / PAVE",
    why: "Grid, automação e equipamentos elétricos.",
    thesis: "A Europa tem líderes em equipamentos elétricos, automação e componentes críticos para infraestrutura, IA e data centers.",
    names: ["Schneider Electric", "Siemens", "ABB", "Legrand", "Prysmian", "Assa Abloy", "Atlas Copco", "Sandvik", "Infineon", "STMicroelectronics", "ASML"],
    points: ["Conversa com IA, energia e data centers.", "ETF industrial amplo dilui qualidade.", "Cesta captura melhor equipamentos e automação."],
  },
  {
    theme: "Semicondutores europeus",
    icon: "chip",
    status: "Parcial",
    quality: "ETF parcial",
    tone: "sat-risk-high",
    implementation: "Cesta",
    etfs: "SMH / SOXX como proxy global; cesta para Europa pura",
    tag: "SMH / SOXX",
    why: "ASML, power semis e equipment crítico.",
    thesis: "A Europa não domina toda a cadeia, mas controla peças críticas em equipment, analog e power semis.",
    names: ["ASML", "Infineon", "STMicroelectronics", "ASM International", "BE Semiconductor", "Soitec"],
    points: ["ASML é difícil de replicar.", "Exposição concentrada em poucos nomes.", "Cesta evita diluição."],
  },
];

function EuropeModule() {
  const legendOrder = { "sat-risk-high": 0, "sat-risk-defensive": 1, "sat-risk-medium": 2 };
  const sortedThemes = [...EUROPE_THEMES].sort((a, b) => legendOrder[a.tone] - legendOrder[b.tone] || a.theme.localeCompare(b.theme, "pt-BR"));
  const [selectedTheme, setSelectedTheme] = useState("Defesa europeia");
  const active = EUROPE_THEMES.find((item) => item.theme === selectedTheme) || EUROPE_THEMES[0];

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "risk-legend", style: { padding: "14px 16px 0" } },
        React.createElement("span", { className: "sat-risk-high" }, "Estratégia de crescimento local"),
        React.createElement("span", { className: "sat-risk-defensive" }, "Tema defensivo"),
        React.createElement("span", { className: "sat-risk-medium" }, "Exposição à China")
      ),
      React.createElement(
        "div",
        { className: "satellite-grid", style: { paddingTop: 16 } },
        sortedThemes.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card ${item.tone}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme)),
              React.createElement("p", null, item.why)
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Tema selecionado"),
      React.createElement("div", { className: `satellite-detail-head ${active.tone}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "ETF amplo"), React.createElement("strong", null, active.status)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Alternativa"), React.createElement("strong", null, active.implementation)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Leitura do veículo"), React.createElement("strong", null, active.quality)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Primeira camada"), React.createElement("strong", null, active.etfs))
      ),
      React.createElement("p", null, active.thesis),
      React.createElement("ul", { className: "satellite-list" }, active.points.map((point) => React.createElement("li", { key: point }, point))),
      React.createElement("div", { className: "detail-box proxy-box" }, React.createElement("span", null, "Exemplos"), React.createElement("strong", null, active.names.join(" · "))),
      React.createElement("p", { className: "data-note" }, "Base: exemplos de ETFs e proxies, junho/2026. Lista não exaustiva.")
    )
  );
}

const CHINA_FILTERS = {
  channel: [
    ["all", "Todos"],
    ["direct", "China direta"],
    ["indirect", "China indireta"],
    ["china1", "China+1"],
  ],
  motor: [
    ["all", "Todos"],
    ["market", "Mercado"],
    ["consumer", "Consumo"],
    ["physical", "Demanda física"],
    ["technology", "Tecnologia"],
    ["chain", "Cadeia"],
  ],
};

const CHINA_CHANNELS = [
  {
    theme: "China direta",
    icon: "network",
    channel: "direct",
    motor: "market",
    tone: "sat-risk-high",
    instruments: "MCHI, FXI, KWEB, ASHR, KBA",
    captures: "Mercado acionário chinês, consumo local, internet e A-shares.",
    risk: "Governança, intervenção estatal, geopolítica, VIEs e deflação.",
    reading: "Exposição pura, mas risco alto. Comprar China exige escolher qual China.",
    points: ["MCHI compra China ampla.", "FXI concentra large caps/Hong Kong.", "KWEB compra internet chinesa.", "ASHR/KBA compram A-shares onshore."],
    names: ["Alibaba", "Tencent", "PDD", "Baidu", "A-shares", "large caps Hong Kong"],
  },
  {
    theme: "China indireta — luxo",
    icon: "diamond",
    channel: "indirect",
    motor: "consumer",
    tone: "sat-risk-medium",
    instruments: "LVMH, Hermès, Ferrari, Richemont, Moncler, Prada, L'Oréal",
    captures: "Consumidor chinês premium e demanda asiática sem comprar bolsa chinesa diretamente.",
    risk: "Ciclo de consumo chinês, turismo, confiança e desaceleração de renda.",
    reading: "Mais qualidade e menor risco político direto, mas ainda dependente do consumidor asiático.",
    points: ["Marcas globais, margens altas e pricing power.", "Menor risco jurídico/político direto.", "ETF de luxo existe, mas cesta costuma ser mais limpa."],
    names: ["LVMH", "Hermès", "Ferrari", "Richemont", "Moncler", "Prada", "L'Oréal", "EssilorLuxottica"],
  },
  {
    theme: "China indireta — commodities",
    icon: "energy",
    channel: "indirect",
    motor: "physical",
    tone: "sat-risk-medium",
    instruments: "BHP, Rio Tinto, Freeport, Glencore, Vale, COPX, PICK",
    captures: "Demanda chinesa por cobre, minério, energia e infraestrutura.",
    risk: "Ciclo industrial, construção, estímulo estatal e preço de commodities.",
    reading: "Aqui a China aparece como comprador físico, não como mercado acionário.",
    points: ["Exposição mais ligada a recursos reais.", "Mais cíclica e sensível a estímulo.", "Boa para separar China física de China listada."],
    names: ["BHP", "Rio Tinto", "Freeport-McMoRan", "Glencore", "Vale", "COPX", "PICK"],
  },
  {
    theme: "China indireta — tecnologia",
    icon: "chip",
    channel: "indirect",
    motor: "technology",
    tone: "sat-risk-high",
    instruments: "ASML, TSMC, Applied Materials, Lam, KLA, Nvidia, Broadcom",
    captures: "Cadeia tecnológica global com demanda chinesa e gargalos estratégicos.",
    risk: "Sanções, restrições de exportação, Taiwan e competição geopolítica.",
    reading: "Exposição estratégica, mas com geopolítica no centro da tese.",
    points: ["Captura gargalos de semicondutores e equipment.", "Não depende apenas do consumidor chinês.", "Export controls podem mudar a tese rapidamente."],
    names: ["ASML", "TSMC", "Applied Materials", "Lam Research", "KLA", "Nvidia", "Broadcom"],
  },
  {
    theme: "China+1",
    icon: "factory",
    channel: "china1",
    motor: "chain",
    tone: "sat-risk-defensive",
    instruments: "INDA, FLIN, EWW, VNM, EWT, EWY",
    captures: "Diversificação de cadeia, nearshoring e manufatura alternativa.",
    risk: "Valuation, execução local, infraestrutura e capacidade institucional.",
    reading: "Não é abandonar China. É comprar seguro contra concentração em uma única cadeia.",
    points: ["Índia combina mercado doméstico, serviços e escala demográfica.", "México captura nearshoring para os EUA.", "Vietnã e Sudeste Asiático capturam manufatura alternativa."],
    names: ["Índia", "México", "Vietnã", "Indonésia", "Taiwan", "Coreia"],
  },
  {
    theme: "EM ex-China",
    icon: "grid",
    channel: "china1",
    motor: "chain",
    tone: "sat-risk-defensive",
    instruments: "EMXC / EXCH",
    captures: "Emergentes sem peso dominante da China.",
    risk: "Perde eventual recuperação chinesa e pode diluir teses específicas.",
    reading: "Solução estrutural para reduzir risco China sem abandonar emergentes.",
    points: ["Remove o risco dominante chinês do bloco emergente.", "Ajuda na construção de core EM mais neutro geopoliticamente.", "Menos tático; mais arquitetura de carteira."],
    names: ["Índia", "Taiwan", "Coreia", "Brasil", "México", "Sudeste Asiático"],
  },
];

function ChinaModule() {
  const [filters, setFilters] = useState({ channel: "all", motor: "all" });
  const [selectedTheme, setSelectedTheme] = useState("China direta");
  const order = { direct: 0, indirect: 1, china1: 2 };
  const filtered = CHINA_CHANNELS.filter((item) =>
    Object.entries(filters).every(([key, value]) => value === "all" || item[key] === value)
  ).sort((a, b) => order[a.channel] - order[b.channel] || a.theme.localeCompare(b.theme, "pt-BR"));
  const active = filtered.find((item) => item.theme === selectedTheme) || filtered[0] || CHINA_CHANNELS[0];

  const filterRow = (key, label, extraClass = "") =>
    React.createElement(
      "div",
      { className: `filter-row ${extraClass}`.trim(), key },
      React.createElement("span", { className: "filter-label" }, label),
      CHINA_FILTERS[key].map(([value, text]) =>
        React.createElement(
          "button",
          {
            className: "filter-chip",
            type: "button",
            key: value,
            "aria-pressed": filters[key] === value,
            onClick: () => setFilters({ ...filters, [key]: value }),
          },
          text
        )
      )
    );

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Matriz de exposição"), React.createElement("h2", null, "Direta, indireta ou substituição parcial"))
      ),
      React.createElement(
        "div",
        { className: "satellite-filters" },
        filterRow("channel", "Canal", "satellite-mobile-hide"),
        filterRow("motor", "Motor", "satellite-mobile-hide"),
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "Risco geopolítico direto"),
          React.createElement("span", { className: "sat-risk-medium" }, "Demanda chinesa indireta"),
          React.createElement("span", { className: "sat-risk-defensive" }, "China+1 / redução de dependência")
        )
      ),
      React.createElement(
        "div",
        { className: "satellite-grid" },
        filtered.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card ${item.tone}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme))
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Canal selecionado"),
      React.createElement("div", { className: `satellite-detail-head ${active.tone}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Instrumentos"), React.createElement("strong", null, active.instruments)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Captura"), React.createElement("strong", null, active.captures)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Risco principal"), React.createElement("strong", null, active.risk))
      ),
      React.createElement("p", null, active.reading),
      React.createElement("ul", { className: "satellite-list" }, active.points.map((point) => React.createElement("li", { key: point }, point))),
      React.createElement("div", { className: "detail-box proxy-box" }, React.createElement("span", null, "Exemplos"), React.createElement("strong", null, active.names.join(" · "))),
      React.createElement("p", { className: "data-note" }, "Base: exemplos de canais e instrumentos, junho/2026. Composição deve ser checada no provedor.")
    )
  );
}

const HEDGE_FILTERS = {
  objective: [
    ["all", "Todos"],
    ["income", "Renda"],
    ["beta", "Beta"],
    ["stress", "Stress"],
    ["payoff", "Payoff"],
  ],
};

const HEDGE_STRATEGIES = [
  {
    theme: "Hedge macro",
    icon: "diamond",
    objective: "stress",
    tone: "sat-risk-defensive",
    instruments: "GLD, IAU, FXF / CHF",
    does: "Combina reserva de valor, moeda forte e proteção de regime.",
    use: "Diversificar risco de moeda, confiança institucional e choques macro.",
    limit: "Não é hedge perfeito de queda de bolsa; pode ficar parado em bull market.",
    reading: "Dólar é referência de proteção contra Brasil. Franco suíço expressa qualidade monetária. Ouro funciona como hedge de regime.",
    examples: ["GLD: ouro físico com alta liquidez", "IAU: ouro físico com custo competitivo", "FXF / CHF: exposição ao franco suíço"],
  },
  {
    theme: "Income de opções",
    icon: "network",
    objective: "income",
    tone: "sat-risk-medium",
    instruments: "JEPI, JEPQ, XYLD, QYLD",
    does: "Vende calls para transformar parte da alta esperada em renda corrente.",
    use: "Mercado lateral ou carteira que prioriza income.",
    limit: "Continua sendo equity e fica para trás em alta forte.",
    reading: "Renda hoje em troca de menos upside amanhã.",
    examples: ["JEPI: equity defensivo + opções", "JEPQ: Nasdaq/growth + opções", "XYLD: S&P 500 covered call", "QYLD: Nasdaq 100 covered call"],
  },
  {
    theme: "Equity defensivo / min-vol",
    icon: "shield",
    objective: "beta",
    tone: "sat-risk-defensive",
    instruments: "USMV, SPLV, MVOL / Min Vol UCITS",
    does: "Troca bolsa agressiva por uma cesta historicamente menos volátil.",
    use: "Reduzir beta sem sair de equity.",
    limit: "Ainda cai em crise e pode perder em bull market concentrado.",
    reading: "Menos beta, não menos mercado.",
    examples: ["USMV: min-vol EUA", "SPLV: baixa volatilidade no S&P 500", "MVOL / UCITS: versões globais ou regionais"],
  },
  {
    theme: "Volatilidade / VIX",
    icon: "pulse",
    objective: "stress",
    tone: "sat-risk-high",
    instruments: "VIXY, VXX, UVXY, VIX futures UCITS",
    does: "Ganha quando a volatilidade implícita dispara.",
    use: "Stress curto, evento específico ou proteção tática.",
    limit: "Decay e rolagem tornam o carregamento caro.",
    reading: "Tende a funcionar como proteção de emergência.",
    examples: ["VIXY: futuros curtos de VIX", "VXX: ETN de futuros curtos", "UVXY: alavancado", "UCITS: alternativa offshore"],
  },
  {
    theme: "Hedge tático direcional",
    icon: "shield",
    objective: "stress",
    tone: "sat-risk-high",
    instruments: "SH, PSQ, RWM, EUM, SDS, QID, SQQQ, SPXU",
    does: "Sobe quando o índice cai, geralmente em base diária.",
    use: "Hedge curto sem vender a posição original.",
    limit: "Compounding e decay punem carregamento longo.",
    reading: "Direcional, curto prazo e disciplinado.",
    examples: ["SH: -1x S&P 500", "PSQ: -1x Nasdaq-100", "RWM: -1x small caps", "EUM: -1x emergentes", "SDS / QID / SQQQ / SPXU: alavancados"],
  },
  {
    theme: "Buffered / defined outcome",
    icon: "server",
    objective: "payoff",
    tone: "sat-risk-medium",
    instruments: "Innovator Buffer ETFs, FT Vest Buffer ETFs, AllianzIM Buffered Outcome ETFs",
    does: "Cria buffer de queda em troca de teto de alta.",
    use: "Cliente que aceita cap para reduzir perda moderada.",
    limit: "Depende da janela, do buffer e do cap vigentes.",
    reading: "Proteção parcial, não seguro total.",
    examples: ["Innovator Buffer ETFs: séries como BJAN/BJUN/BJUL", "FT Vest Buffer ETFs: famílias como FJAN/FJUN/FJUL", "AllianzIM Buffered Outcome ETFs: buffer e cap definidos", "Collars/put spreads: estruturas, não ETFs prontos"],
  },
  {
    theme: "Desconcentração",
    icon: "grid",
    objective: "beta",
    tone: "sat-risk-defensive",
    instruments: "RSP, EQWL, QQEW, USMV",
    does: "Reduz dependência de mega caps e liderança estreita.",
    use: "Quando o risco principal é concentração em poucos nomes.",
    limit: "Não costuma mitigar queda geral do mercado.",
    reading: "Hedge de concentração, não de crash.",
    examples: ["RSP: S&P 500 equal weight", "EQWL: S&P 100 equal weight", "QQEW: Nasdaq 100 equal weight", "USMV: min-vol com viés defensivo"],
  },
  {
    theme: "Opções diretas sobre índice",
    icon: "shield",
    objective: "payoff",
    tone: "sat-risk-high",
    instruments: "SPY puts, QQQ puts, put spreads, collars",
    does: "Define piso, custo, prazo e participação na alta.",
    use: "Proteção sob medida em SPY, QQQ ou índices líquidos.",
    limit: "Custa prêmio, vende upside ou limita a proteção.",
    reading: "Mais precisão, mais trade-off.",
    examples: ["Protective put: seguro direto", "Put spread: proteção parcial", "Collar: put + call vendida", "Put spread financiado por call: custo menor, alta limitada"],
  },
];

function HedgeModule() {
  const [filters, setFilters] = useState({ objective: "all" });
  const [selectedTheme, setSelectedTheme] = useState("Income de opções");
  const toneOrder = { "sat-risk-high": 0, "sat-risk-medium": 1, "sat-risk-defensive": 2 };
  const filtered = HEDGE_STRATEGIES.filter((item) =>
    Object.entries(filters).every(([key, value]) => value === "all" || item[key] === value)
  ).sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone] || a.theme.localeCompare(b.theme, "pt-BR"));
  const active = filtered.find((item) => item.theme === selectedTheme) || filtered[0] || HEDGE_STRATEGIES[0];

  const filterRow = (key, label) =>
    React.createElement(
      "div",
      { className: "filter-row", key },
      React.createElement("span", { className: "filter-label" }, label),
      HEDGE_FILTERS[key].map(([value, text]) =>
        React.createElement(
          "button",
          {
            className: "filter-chip",
            type: "button",
            key: value,
            "aria-pressed": filters[key] === value,
            onClick: () => setFilters({ ...filters, [key]: value }),
          },
          text
        )
      )
    );

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Estratégias de hedge"), React.createElement("h2", null, "Payoff, beta, volatilidade e moeda"))
      ),
      React.createElement(
        "div",
        { className: "satellite-filters" },
        filterRow("objective", "Objetivo"),
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "Tático / alto custo de carregamento"),
          React.createElement("span", { className: "sat-risk-medium" }, "Payoff / income"),
          React.createElement("span", { className: "sat-risk-defensive" }, "Redução de beta")
        )
      ),
      React.createElement(
        "div",
        { className: "satellite-grid" },
        filtered.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card ${item.tone}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme)),
              React.createElement("p", null, item.reading)
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Hedge selecionado"),
      React.createElement("div", { className: `satellite-detail-head ${active.tone}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Instrumentos"), React.createElement("strong", null, active.instruments)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "O que faz"), React.createElement("strong", null, active.does)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Uso típico"), React.createElement("strong", null, active.use)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Limitação"), React.createElement("strong", null, active.limit))
      ),
      React.createElement("p", null, active.reading),
      React.createElement("ul", { className: "satellite-list" }, active.examples.map((point) => React.createElement("li", { key: point }, point))),
      React.createElement("p", { className: "data-note" }, "Base: instrumentos líquidos e estruturas comuns, junho/2026. Produtos táticos exigem checagem de prazo, liquidez, custo e regra diária.")
    )
  );
}

function CoreModule({ functions = CORE_EQUITY_FUNCTIONS, initialEtf = "VOO", legendMode = "equity", showUcitsToggle = true } = {}) {
  const [selectedEtf, setSelectedEtf] = useState(initialEtf);
  const [ucitsView, setUcitsView] = useState("all");
  const [geoData, setGeoData] = useState(null);
  const [geoResult, setGeoResult] = useState(null);
  useEffect(() => {
    let cancelled = false;
    DataClient.load("etf-geography")
      .then((result) => {
        if (cancelled) return;
        setGeoResult(result);
        setGeoData(result.ok ? result.data : null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const selectCoreEtf = (ticker) => {
    setSelectedEtf(ticker);
    if (window.matchMedia("(max-width: 720px)").matches) {
      window.setTimeout(() => {
        const title = document.querySelector(".core-detail h2");
        if (!title) return;
        const top = title.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top, behavior: "smooth" });
      }, 60);
    }
  };
  const setCoreUcitsView = (nextView) => {
    setUcitsView(nextView);
    if (nextView === "ucits" && !UCITS_TICKERS.has(selectedEtf)) {
      const fallback = functions.flatMap((row) => row.tickers).find((ticker) => UCITS_TICKERS.has(ticker)) || "CSPX";
      setSelectedEtf(fallback);
    }
  };
  const detail = CORE_DETAILS[selectedEtf] || CORE_DETAILS.VOO;
  const geography = geoData?.instruments?.[selectedEtf];
  const countryWeights = geography?.weights || CORE_COUNTRY_WEIGHTS[selectedEtf];
  const maxCountryWeight = countryWeights ? Math.max(...countryWeights.map((row) => row[1])) : 0;

  return React.createElement(
    "main",
    { className: "tech-layout" },
    React.createElement(
      "section",
      { className: "core-layout" },
      React.createElement(
        "article",
        { className: "panel" },
        React.createElement("div", { className: "section-head" }, React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Matriz de implementação"))),
        React.createElement(
          "div",
          { className: "core-legend-row" },
          React.createElement(
            "div",
            { className: "core-legend" },
            legendMode === "fixed"
              ? React.createElement(React.Fragment, null,
                  React.createElement("span", { className: "etf-token etf-fixed" }, "Treasuries USD Acc"),
                  React.createElement("span", { className: "etf-token etf-fixed" }, "TIPS USD Acc"),
                  React.createElement("span", { className: "etf-token etf-fixed" }, "Crédito / bonds")
                )
              : React.createElement(React.Fragment, null,
                  React.createElement("span", { className: "etf-token etf-us" }, "EUA"),
                  React.createElement("span", { className: "etf-token etf-global" }, "Global desenvolvido"),
                  React.createElement("span", { className: "etf-token etf-developed" }, "Developed ex-US"),
                  React.createElement("span", { className: "etf-token etf-emerging" }, "Emergentes")
                )
          ),
          showUcitsToggle
            ? React.createElement(
                "div",
                { className: "ucits-toggle", "aria-label": "Destaque UCITS" },
                React.createElement("button", { type: "button", "aria-pressed": ucitsView === "all", onClick: () => setCoreUcitsView("all") }, "Todos"),
                React.createElement("button", { type: "button", "aria-pressed": ucitsView === "ucits", onClick: () => setCoreUcitsView("ucits") }, "UCITS")
              )
            : null
        ),
        React.createElement(
          "div",
          { className: "core-function-grid" },
          functions.map((row) =>
            React.createElement(
              "div",
              { className: "core-function", key: row.fn },
              React.createElement("div", null, React.createElement("h3", null, row.fn), React.createElement("p", null, row.why), React.createElement("p", null, row.note)),
              React.createElement(
                "div",
                { className: "etf-token-grid" },
                row.tickers.map((ticker) =>
                  React.createElement("button", { className: coreTokenClass(ticker, ucitsView), type: "button", key: `${row.fn}-${ticker}`, "aria-pressed": selectedEtf === ticker, disabled: ucitsView === "ucits" && !UCITS_TICKERS.has(ticker), onClick: () => selectCoreEtf(ticker) }, ticker)
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "aside",
        { className: "panel core-detail" },
        React.createElement("h2", null, selectedEtf),
        React.createElement("span", { className: "detail-role" }, detail[0]),
        React.createElement("p", null, detail[1]),
        React.createElement("p", null, detail[2]),
        countryWeights
          ? React.createElement(
              "div",
              { className: "mini-country-chart" },
              React.createElement("h3", null, "Composição geográfica aprox."),
              countryWeights.map(([country, weight]) =>
                React.createElement(
                  "div",
                  { className: "mini-country-row", key: `${selectedEtf}-${country}` },
                  React.createElement("span", null, country),
                  React.createElement("div", { className: "mini-country-track" }, React.createElement("div", { className: "mini-country-bar", style: { width: `${(weight / maxCountryWeight) * 100}%` } })),
                  React.createElement("span", null, `${weight.toFixed(1).replace(".", ",")}%`)
                )
              ),
              React.createElement(
                "p",
                { className: "data-note" },
                geography
                  ? `Fonte: ${geography.source}.`
                  : "Pesos aproximados por país. Base: lâminas dos provedores e benchmarks, junho/2026."
              )
            )
          : null,
        React.createElement("ul", { className: "core-detail-list" }, detail[3].map((point) => React.createElement("li", { key: point }, point)))
      )
    )
  );
}

function FixedIncomeModule() {
  return React.createElement(CoreModule, { functions: FIXED_INCOME_FUNCTIONS, initialEtf: "IB01", legendMode: "fixed", showUcitsToggle: false });
}

const SECTOR_GICS_ETFS = [
  { ticker: "XLK", sector: "Information Technology", icon: "chip", tone: "sat-risk-high", role: "Growth / qualidade", why: "Software, semicondutores e infraestrutura digital.", limit: "Alta concentração e múltiplos mais sensíveis à revisão de crescimento.", points: ["Proxy mais direto de tecnologia no S&P 500.", "Carrega parte relevante da liderança estrutural do índice.", "Bom para testar prêmio de growth contra o benchmark."] },
  { ticker: "XLC", sector: "Communication Services", icon: "phone", tone: "sat-risk-high", role: "Plataformas / mídia", why: "Mega plataformas digitais, mídia, streaming e telecom.", limit: "Mistura negócios muito diferentes e pode ficar concentrado em poucos nomes.", points: ["Útil para separar plataformas digitais de tecnologia pura.", "Conversa com publicidade, conteúdo e distribuição.", "Não é defensivo apesar de incluir telecom."] },
  { ticker: "XLY", sector: "Consumer Discretionary", icon: "diamond", tone: "sat-risk-high", role: "Consumo cíclico", why: "E-commerce, autos, varejo e consumo sensível à renda.", limit: "Carrega ciclo econômico, confiança do consumidor e concentração em líderes.", points: ["Bom termômetro de apetite ao risco doméstico.", "Pode capturar consumo premium e plataformas de varejo.", "Sofre mais em desaceleração e juros altos."] },
  { ticker: "XLB", sector: "Materials", icon: "factory", tone: "sat-risk-medium", role: "Ciclo / commodities", why: "Químicos, metais, materiais e insumos industriais.", limit: "Muito ligado a ciclo global, dólar e demanda por commodities.", points: ["Funciona como leitura de ciclo industrial.", "Complementa energia e industriais.", "Não substitui exposição direta a commodities."] },
  { ticker: "XLE", sector: "Energy", icon: "oil", tone: "sat-risk-medium", role: "Energia tradicional", why: "Petróleo, gás, majors e geração de caixa do setor energético.", limit: "Sensível a preço de petróleo, geopolítica e disciplina de CAPEX.", points: ["Hedge parcial contra choque energético.", "Carrega dividendos e buybacks do setor.", "É mais energia tradicional do que transição energética."] },
  { ticker: "XLF", sector: "Financials", icon: "money", tone: "sat-risk-medium", role: "Juros / crédito", why: "Bancos, seguros, cartões, brokers e mercado de capitais.", limit: "Depende de curva de juros, crédito e ciclo de inadimplência.", points: ["Boa leitura de ciclo financeiro americano.", "Pode se beneficiar de curva mais inclinada.", "Risco aumenta quando crédito deteriora."] },
  { ticker: "XLI", sector: "Industrials", icon: "factory", tone: "sat-risk-medium", role: "Ciclo / CAPEX", why: "Indústria, transporte, defesa, máquinas e infraestrutura.", limit: "ETF amplo dilui teses específicas como defesa ou reindustrialização.", points: ["Bom bloco para ciclo físico e CAPEX.", "Conversa com onshoring e infraestrutura.", "Para tese precisa, cesta pode ser melhor."] },
  { ticker: "XLP", sector: "Consumer Staples", icon: "home", tone: "sat-risk-defensive", role: "Defensivo / consumo essencial", why: "Marcas, alimentos, bebidas, higiene e varejo essencial.", limit: "Pode ficar para trás em bull market de growth.", points: ["Reduz ciclicidade dentro de equity.", "Boa proxy de estabilidade de margem.", "Sensível a custos e elasticidade de preço."] },
  { ticker: "XLV", sector: "Health Care", icon: "pulse", tone: "sat-risk-defensive", role: "Qualidade defensiva", why: "Pharma, serviços, equipamentos médicos e managed care.", limit: "Mistura defensividade com risco regulatório e pipeline de inovação.", points: ["Boa camada de qualidade menos cíclica.", "Combina demografia, inovação e escala.", "Não é uma tese pura de biotech ou pharma."] },
  { ticker: "XLRE", sector: "Real Estate", icon: "home", tone: "sat-risk-defensive", role: "Imobiliário listado", why: "REITs e ativos imobiliários listados.", limit: "Sensível a juros, crédito, cap rates e vacância.", points: ["Útil para exposição imobiliária líquida.", "Mais duration e crédito do que growth.", "Não substitui real estate privado."] },
  { ticker: "XLU", sector: "Utilities", icon: "faucet", tone: "sat-risk-defensive", role: "Defensivo / duration", why: "Utilities reguladas, eletricidade e infraestrutura essencial.", limit: "Sensível a juros e regulação; não é a mesma coisa que grid específico.", points: ["Defensivo clássico dentro de equity.", "Conversa com eletrificação e demanda de data centers.", "Para grid/IA, pode precisar cesta complementar."] },
];

function SectorGicsModule() {
  const [selectedSector, setSelectedSector] = useState("XLK");
  const activeMeta = SECTOR_GICS_ETFS.find((item) => item.ticker === selectedSector) || SECTOR_GICS_ETFS[0];

  return React.createElement(
    "main",
    { className: "core-layout sector-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Setores GICS / S&P 500"))
      ),
      React.createElement(
        "div",
        { className: "risk-legend" },
        React.createElement("span", { className: "sat-risk-high" }, "Growth / concentração"),
        React.createElement("span", { className: "sat-risk-medium" }, "Cíclico / macro"),
        React.createElement("span", { className: "sat-risk-defensive" }, "Defensivo / juros")
      ),
      React.createElement(
        "div",
        { className: "core-function-grid sector-function-grid" },
        SECTOR_GICS_ETFS.map((item) =>
          React.createElement(
            "div",
            {
              className: `core-function sector-function ${item.tone}`,
              key: item.ticker,
            },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.sector)),
              React.createElement("p", null, item.role),
              React.createElement("p", null, item.why)
            ),
            React.createElement(
              "div",
              { className: "etf-token-grid sector-token-wrap" },
              React.createElement(
                "button",
                {
                  className: `etf-token sector-token ${item.tone}`,
                  type: "button",
                  "aria-pressed": selectedSector === item.ticker,
                  onClick: () => {
                    setSelectedSector(item.ticker);
                    scrollToMobileDetail(".satellite-detail h2");
                  },
                },
                item.ticker
              )
            )
          )
        )
      ),
      React.createElement("p", { className: "data-note" }, "Proxy setorial: SPDR Select Sector ETFs. Dados numéricos ficam no Data Lab.")
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail core-detail" },
      React.createElement("span", { className: "detail-role" }, "Setor selecionado"),
      React.createElement("div", { className: `satellite-detail-head ${activeMeta.tone}` }, React.createElement(SatelliteIcon, { type: activeMeta.icon }), React.createElement("h2", null, activeMeta.ticker)),
      React.createElement("p", null, activeMeta.sector),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Função"), React.createElement("strong", null, activeMeta.role)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "O que captura"), React.createElement("strong", null, activeMeta.why)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Limitação"), React.createElement("strong", null, activeMeta.limit))
      ),
      React.createElement("ul", { className: "satellite-list" }, activeMeta.points.map((point) => React.createElement("li", { key: point }, point)))
    )
  );
}

const ETF_SUBMODULES = [
  ["fixed", "Fixed Income"],
  ["core", "Core Equities"],
  ["sectors", "Setoriais"],
  ["satellites", "Satélites EUA"],
  ["europe", "Temas Europeus"],
  ["china", "China / China+1"],
  ["hedges", "Hedge"],
];

function EtfsModule() {
  const [activeEtfTab, setActiveEtfTab] = useState("fixed");
  const renderActive = () => {
    if (activeEtfTab === "core") return React.createElement(CoreModule);
    if (activeEtfTab === "fixed") return React.createElement(FixedIncomeModule);
    if (activeEtfTab === "sectors") return React.createElement(SectorGicsModule);
    if (activeEtfTab === "satellites") return React.createElement(SatelliteModule);
    if (activeEtfTab === "europe") return React.createElement(EuropeModule);
    if (activeEtfTab === "china") return React.createElement(ChinaModule);
    return React.createElement(HedgeModule);
  };

  return React.createElement(
    "main",
    { className: "etf-shell work-surface" },
    React.createElement(
      "nav",
      { className: "panel etf-subtabs", "aria-label": "Submódulos de ETFs" },
      ETF_SUBMODULES.map(([key, label]) =>
        React.createElement(
          "button",
          {
            key,
            type: "button",
            "aria-pressed": activeEtfTab === key,
            onClick: () => setActiveEtfTab(key),
          },
          label
        )
      )
    ),
    renderActive()
  );
}

window.GCEtfs = {
  EtfsModule,
};
})();


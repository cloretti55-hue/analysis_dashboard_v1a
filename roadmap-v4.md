# Roadmap da plataforma Labs — v4

Atualizado em 2026-07-30.

## Escopo e governança

- Pasta local de trabalho: `C:\Users\Christian\Desktop\Codex\v4`
- Repositório: `cloretti55-hue/analysis_dashboard_v3`
- Domínio: `labs.generalchannels.co`
- Branch inicial: `labs-platform-foundation`
- Fora do escopo: `analysis_dashboard_v2` e `platform.generalchannels.co`
- A pasta local `v3` permanece congelada.

## Princípios

- Evolução incremental, sem reconstrução total.
- JavaScript e React continuam sendo usados nesta etapa.
- Python continua responsável pelos pipelines.
- Nenhum dado ausente será inventado ou preenchido silenciosamente.
- Fallbacks metodologicamente válidos devem registrar origem, data e estado `stale`.
- Falhas de publicação não devem ser mascaradas por fallback do navegador para GitHub Raw.
- Mudanças serão validadas localmente antes de commit, push ou deploy.

## Fase 0 — Baseline Git e inventário

Status: concluída localmente.

Entregas:

- `v4` vinculada a `analysis_dashboard_v3`;
- branch `labs-platform-foundation`;
- JSONs locais alinhados à `origin/main`;
- `.gitignore` para caches, instaladores e artefatos temporários;
- assets extras preservados fora do commit até decisão editorial.

Critério de passagem:

- nenhuma divergência não intencional em arquivos rastreados.

## Fase 1 — Contratos, completude e manifesto

Status: concluída e validada no GitHub Actions.

Primeira evidência:

- os 11 instrumentos de renda fixa estavam com `status: error` no
  `etf-performance.json` por timeout;
- os 11 estavam disponíveis no `fixed-income-performance.json`, com datas de
  22–23/07/2026;
- o fallback era necessário, mas não tinha produtor ou workflow próprio.

Primeira correção:

- processar renda fixa antes dos demais instrumentos;
- usar dados anteriores válidos como fallback marcado `stale`;
- usar o snapshot de renda fixa para semear instrumentos ainda sem histórico
  válido no payload principal;
- só substituir o snapshot de renda fixa quando a cobertura estiver completa e
  houver ao menos um instrumento atualizado ao vivo;
- versionar o payload principal e o snapshot de renda fixa no mesmo workflow.

Entregas implementadas:

- validador comum de schemas, cobertura, chaves e datas;
- `data/manifest.json` determinístico;
- status padronizados: `ok`, `stale`, `partial`, `error` e `manual`;
- freshness por dataset e por componente;
- validação antes de qualquer commit automático.

Validação contínua:

- todos os workflows de atualização regeneram e versionam o manifesto;
- mudanças em dados, scripts ou workflows executam `validate-data.yml`;
- cada workflow só é bloqueado por erro estrutural no dataset que ele próprio
  produz;
- erros em datasets não relacionados permanecem visíveis no manifesto sem
  interromper outras atualizações;
- estados `stale` e `partial` ficam visíveis sem bloquear atualizações válidas;
- o manifesto só muda quando os dados mudam ou quando um dataset cruza o
  limite de freshness.

Critério de passagem:

- todo dataset consumido tem produtor, contrato, data, origem e política de
  fallback explícitos.

## Fase 2 — Cliente de dados e Data Lab observável

Status: concluída localmente em 2026-08-04; pendente apenas de publicação e
validação no domínio Labs.

Entregas:

- função única de carregamento e validação de datasets;
- remoção de fallbacks de runtime para GitHub Raw;
- fonte, data, benchmark, metodologia e estado do dado apresentados em linguagem pública adequada;
- diagnóstico técnico preservado no GitHub Actions, sem expor mensagens internas aos visitantes.

Implementação:

- `DataClient` concentra todos os carregamentos JSON e consulta
  `data/manifest.json` para obter status, data, produtor e avisos;
- os módulos recebem resultados isolados com `data`, `meta` e `error`;
- nenhuma URL de runtime aponta para GitHub Raw;
- o Data Lab identifica internamente a base principal e a contingência de renda fixa;
- instrumentos carregados pela contingência preservam origem, data e estado
  `stale` ou `partial`;
- Valuation, curvas, Fed e geografia mantêm os módulos disponíveis sem publicar
  mensagens técnicas brutas;
- um resumo operacional em português é produzido em todos os workflows;
- a composição geográfica é consultada mensalmente nas fontes oficiais da
  Vanguard, iShares e SPDR e preserva o último dado válido quando uma fonte falha;
- testes automatizados impedem a reintrodução de carregamentos dispersos ou
  dependências do GitHub Raw.

Critério de passagem:

- a interface informa origem e data de forma apropriada ao visitante, enquanto
  os detalhes de falha e contingência ficam disponíveis ao operador no Actions.

## Fase 3 — Modularização do `index.html`

Entregas:

- separar cliente de dados;
- separar módulos de Yield Curves, Valuation, ETFs, Data Lab e Temas;
- separar estilos globais e estilos por módulo;
- manter comportamento, visual e URLs durante a extração.

Tecnologia:

- JavaScript e React permanecem;
- TypeScript ou Vite só serão avaliados depois da separação e dos testes.

Critério de passagem:

- o `index.html` deixa de concentrar lógica, conteúdo, dados e estilos sem uma
  migração disruptiva.

## Fase 4 — Navegação e linguagem

Entregas:

- hierarquia orientada a Macro, Valuation, Instrumentos, Data Lab e Temas;
- links contextuais para o Data Lab;
- separação entre fato, cálculo, interpretação e limitação;
- substituição de linguagem prescritiva por linguagem educacional e descritiva.

Critério de passagem:

- nenhuma tela depende de linguagem de recomendação para explicar o dado.

## Fase 5 — Testes e publicação

Entregas:

- testes de dados e schemas;
- testes dos carregadores;
- verificação desktop e mobile;
- validação dos workflows;
- publicação controlada exclusivamente em `labs.generalchannels.co`.

Critério de passagem:

- deploy aprovado somente após dados, interface e rotas passarem nas
  verificações definidas.

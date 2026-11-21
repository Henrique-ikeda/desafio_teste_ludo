# Planejamento — desafio_teste_ludo

Ludo para **2 jogadores** (Vermelho e Amarelo) no mesmo computador: **Casos de teste de interface em JavaScript**. O jogo em si não é implementado (a entrega são só os testes); os testes ficam falhando pelo motivo certo.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Henrique Kendi Ikeda (RA 24039456-2) | Henrique-ikeda | Setup do projeto e testes de: início, dado, sair da base, mover, reta final e chegada (tarefas A1–A5) |
| Felipe Galeti Gôngora (RA 24036480-2) | FGaleti | CI, README e testes de: captura, casas seguras, vez, vitória e nova partida (tarefas F1–F5) |

---

## 1. Regras do jogo (o que os testes verificam)

- **2 jogadores** no mesmo computador: **Vermelho** e **Amarelo**, com **4 peões** cada. Todos começam na **base**. O Vermelho joga primeiro.
- **Percurso:** 52 casas, `c1` a `c52`, em círculo (depois de `c52` vem `c1`).
  - **Vermelho:** sai em `c1`, anda até `c51`, entra na sua **reta final** `v1` a `v5` e depois na **chegada**. São 56 passos da saída até a chegada.
  - **Amarelo:** sai em `c27`, anda `c28` … `c52`, `c1` … `c25`, entra na reta final `a1` a `a5` e depois na chegada.
  - Só o dono entra na própria reta final; ali e na chegada o peão não pode ser capturado.
- **Vez:** o jogador rola o **dado** (1 a 6) e depois clica num peão que possa andar aquele número. Enquanto ele não move, não pode rolar de novo.
- **Sair da base:** só com **6**. O peão vai para a casa de saída da sua cor.
- **Tirou 6:** depois de mover, o mesmo jogador joga de novo.
- **Mover:** o peão anda exatamente o número do dado, no sentido do percurso. Peões que não podem andar aquele número não se mexem ao serem clicados.
- **Chegada exata:** se o número passa da chegada, aquele peão não pode andar.
- **Sem jogada:** se nenhum peão do jogador pode andar com o número tirado (mesmo sendo 6), a mensagem mostra "Sem jogada" e a vez passa sozinha para o outro.
- **Captura:** se o peão termina numa casa do percurso com peão(ões) do adversário, **todos** esses peões voltam para a base. Peões da mesma cor podem dividir uma casa.
- **Casas seguras** (não há captura): as saídas `c1`, `c14`, `c27`, `c40` e as estrelas `c9`, `c22`, `c35`, `c48`. Nelas, peões de cores diferentes ficam juntos.
- **Vitória:** quem levar os 4 peões à chegada vence: "Vermelho venceu!" ou "Amarelo venceu!". Depois disso não se rola mais o dado.
- **Nova partida:** todos os peões voltam para a base, o Vermelho começa.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega | **Somente os casos de teste** (`tests/`). O código do jogo não é implementado |
| Executor dos testes | [Jest](https://jestjs.io) 29, com `babel-jest` (converte os ES Modules para CommonJS só nos testes) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`testEnvironment: 'jsdom'`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos fixos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (jest) — TODOS falham, de propósito
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
```

### Por que os testes ficam falhando

O jogo não existe. Cada teste é escrito a partir da especificação (seções 1, 3 e 5) e precisa **falhar pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `Unable to find an element by: [data-testid="..."]` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro no próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Teste passando:** se passa com a tela vazia, ele não testa nada. Reescreva-o para conferir o comportamento da seção 5.

O `scripts/verificar-testes.mjs` faz essa conferência sozinho; o CI e o hook dos agentes usam ele.

### Esqueleto da tela (`index.html`)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-*` de estado, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- Os peões (`peao-<cor>-<n>`) são criados pelo jogo e **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` fica só com um comentário.

### Como um teste abre o jogo — `tests/helpers.js`

`abrirJogo(params)` põe os parâmetros na URL, carrega o `index.html`, importa o `js/main.js` de novo (cada teste começa um jogo novo) e devolve o `user` do user-event para clicar como um jogador.

```js
import { abrirJogo, peao, rolar, screen } from './helpers.js';

test('TC-LD-10 vermelho entra na reta final', async () => {
  const user = await abrirJogo({ vermelho: 'c49,base,base,base', dados: '4' });
  await rolar(user);
  await user.click(peao('vermelho', 1));
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'v2');
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê e clica: `screen.getByTestId(...)`, os atalhos do `helpers.js` e `user.click`/`user.dblClick`/`cliqueDireito(user, el)`. Nada de importar `js/*.js` ou chamar funções internas.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- O dado é controlado pelo **parâmetro de URL `dados`** e as posições pelos parâmetros `vermelho`, `amarelo` e `vez` (seção 3). Um teste nunca depende de sorte; sem os parâmetros, o teste só pode conferir regras que valem para qualquer rolagem.
- Cada caso de teste da seção 5 vira um `test('TC-LD-NN ...')` com o **mesmo ID no título** (o verificador exige). Caso parametrizado → `test.each`, que conta como um caso só.
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd A2)
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd A2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/MATRIZ-COBERTURA.md         cada regra da seção 1 → casos de teste que a cobrem
```

### Estrutura e dono de cada arquivo

```
desafio_teste_ludo/
├── index.html                    A1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js                    A1  vazio (o jogo não é implementado)
├── tests/helpers.js              A1  abrirJogo(), posições e dados fixos e atalhos
├── tests/dado-e-saida.spec.js    Henrique  (A2, A3)
├── tests/movimento.spec.js       Henrique  (A4, A5)
├── tests/captura.spec.js         Felipe    (F2, F3)
├── tests/vez.spec.js             Felipe    (F4)
├── tests/fim-de-jogo.spec.js     Felipe    (F5)
├── .github/workflows/testes.yml  Felipe    (F1)
├── README.md                     Felipe    (F1; cada um atualiza a sua parte da tabela)
├── babel.config.cjs              A1  só para os testes (Jest): ESM → CommonJS
└── package.json                  A1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `tabuleiro` | O tabuleiro |
| `peao-vermelho-1` … `peao-vermelho-4`, `peao-amarelo-1` … `peao-amarelo-4` | Os 8 peões. `data-casa` = `base` \| `c1`…`c52` \| `v1`…`v5` (reta do Vermelho) \| `a1`…`a5` (reta do Amarelo) \| `chegada`. `data-movel` = `true` quando o peão pode andar com o dado atual, `false` nos outros casos |
| `dado` | Valor do último dado rolado (vazio antes da primeira rolagem) |
| `btn-rolar` | Rola o dado (`disabled` enquanto o jogador precisa mover ou depois do fim) |
| `vez` | "Vermelho" ou "Amarelo" |
| `chegada-vermelho` / `chegada-amarelo` | Quantos peões de cada cor já chegaram (número) |
| `mensagem` | "Sem jogada", "Vermelho venceu!", "Amarelo venceu!" (vazia nas outras situações) |
| `btn-nova-partida` | Recomeça a partida |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `dados` | `?dados=6,3,5` | Valores do dado, em ordem, um por rolagem (de qualquer jogador). Depois de acabar a lista, o dado volta a ser aleatório |
| `vermelho` | `?vermelho=c10,base,v2,chegada` | Casa de cada peão vermelho, do 1 ao 4 |
| `amarelo` | `?amarelo=c8,base,base,base` | Casa de cada peão amarelo, do 1 ao 4 |
| `vez` | `?vez=amarelo` | Quem joga primeiro (padrão: vermelho) |

`vermelho`, `amarelo` e `vez` valem só ao abrir a página. A "Nova partida" sempre começa do zero: todos os peões na base e o Vermelho jogando.

### Posições usadas nos testes

| Situação | Casa | Por quê |
|---|---|---|
| Vermelho em `c49` + 4 | `v2` | `c50`, `c51`, `v1`, `v2` |
| Amarelo em `c50` + 5 | `c3` | `c51`, `c52`, `c1`, `c2`, `c3` (dá a volta) |
| Amarelo em `c24` + 3 | `a2` | `c25`, `a1`, `a2` |
| Vermelho em `v4` + 2 | `chegada` | exato; com 3 passaria da chegada |
| Vermelho em `c5` + 4 | `c9` | estrela (segura) |

As casas de todos os movimentos dos casos de teste foram conferidas por script.

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. Escrever o teste do TC só a partir da especificação (seções 1, 3 e 5), sem código do jogo.
2. Rodar só ele (`npx jest tests/<arquivo>.spec.js -t "TC-LD-NN"`) e conferir que **falha pelo motivo certo**: asserção ou elemento não encontrado, e não erro do próprio teste.
3. `npm run verificar` sem problemas → commit `test: TC-LD-NN <cenário>`.
4. No fim da tarefa: revisão, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos de teste diferentes** (coluna "Arquivos"). Assim, depois da A1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da A1: se precisar mudar, combinem antes e façam um commit pequeno e separado. Tarefas que usam o mesmo arquivo: faça o merge de uma antes de começar a outra.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd A2` no Claude Code ou `$tdd A2` no Codex; depois, "go" escreve o próximo TC. Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Henrique (tarefas A)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **A1** Setup: `package.json`, `babel.config.cjs`, `js/main.js` vazio, `.gitignore`, `index.html` esqueleto, `tests/helpers.js`, verificador, skill, sub-agentes e hooks, PLANEJAMENTO e docs | `main` (repositório vazio, commit direto) | tudo | — |
| **A2** Início e dado | `henrique/a2-inicio-dado` | tests/dado-e-saida.spec.js | 01, 02, 07 |
| **A3** Sair da base | `henrique/a3-sair-da-base` | tests/dado-e-saida.spec.js | 03, 04, 05, 31, 32 |
| **A4** Mover no percurso | `henrique/a4-mover` | tests/movimento.spec.js | 06, 08, 09 |
| **A5** Reta final e chegada | `henrique/a5-reta-final` | tests/movimento.spec.js | 10, 11, 12 |

**IDs extras (casos além dos 24 originais):** `TC-LD-25` a `TC-LD-30` ficam reservados para o Felipe; os do Henrique começam em `TC-LD-31`. Cada caso extra entra na seção 5, na matriz de cobertura e no README no mesmo PR do teste.

### Felipe (tarefas F)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **F1** CI no GitHub Actions + README (conferir e completar) | `felipe/f1-ci-readme` | .github/workflows, README.md | — |
| **F2** Captura | `felipe/f2-captura` | tests/captura.spec.js | 13, 14 |
| **F3** Casas seguras | `felipe/f3-casas-seguras` | tests/captura.spec.js | 15, 16, 17 |
| **F4** Vez e sem jogada | `felipe/f4-vez` | tests/vez.spec.js | 18, 19, 20 |
| **F5** Vitória e nova partida | `felipe/f5-fim` | tests/fim-de-jogo.spec.js | 21, 22, 23, 24 |

## 5. Casos de teste (interface)

"Rolar" = clicar `btn-rolar`. Peões não citados nos parâmetros de posição ficam na base.

### Henrique — início, dado, sair da base e mover

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-LD-01 | Início da partida | Sem parâmetros. Abrir a página | Os 8 peões com `data-casa` = `base`; `vez` = "Vermelho"; `dado` vazio; `btn-rolar` habilitado; `chegada-vermelho` = 0 e `chegada-amarelo` = 0; `mensagem` vazia |
| TC-LD-02 | Dado de 1 a 6 | Sem parâmetros. Em 20 partidas novas, rolar uma vez | Em todas, `dado` é um número inteiro de 1 a 6 |
| TC-LD-03 | Sem 6 não sai da base | `?dados=3`. Rolar | `dado` = 3; os 4 peões vermelhos com `data-movel` = `false` e na base; `mensagem` = "Sem jogada"; `vez` = "Amarelo" |
| TC-LD-04 | Com 6 sai da base | `?dados=6`. Rolar; clicar `peao-vermelho-1` | Depois de rolar: os 4 vermelhos com `data-movel` = `true` e os amarelos com `false`. Depois do clique: `peao-vermelho-1` em `c1` |
| TC-LD-05 | Tirou 6, joga de novo | `?dados=6,2`. Rolar; clicar `peao-vermelho-1`; rolar; clicar `peao-vermelho-1` | Depois do 1º movimento: `vez` = "Vermelho" e `btn-rolar` habilitado. Depois do 2º: `peao-vermelho-1` em `c3`; `vez` = "Amarelo" |
| TC-LD-06 | Andar o número do dado | `?vermelho=c1,base,base,base&dados=4`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` em `c5`; `vez` = "Amarelo" |
| TC-LD-07 | Não rola duas vezes | `?dados=6`. Rolar; tentar rolar de novo | Depois da 1ª rolagem `btn-rolar` fica desabilitado; `dado` continua 6; os peões continuam na base até um ser clicado |
| TC-LD-08 | Só peão que pode andar se mexe | `?vermelho=c1,base,base,base&dados=4`. Rolar; clicar `peao-vermelho-2` (na base) | `peao-vermelho-2` com `data-movel` = `false` e continua na base; `peao-vermelho-1` com `data-movel` = `true` e continua em `c1`; `vez` continua "Vermelho" |
| TC-LD-09 | Dar a volta no tabuleiro | `?vez=amarelo&amarelo=c50,base,base,base&dados=5`. Rolar; clicar `peao-amarelo-1` | `peao-amarelo-1` em `c3` |
| TC-LD-10 | Vermelho entra na reta final | `?vermelho=c49,base,base,base&dados=4`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` em `v2` |
| TC-LD-11 | Amarelo entra na reta final | `?vez=amarelo&amarelo=c24,base,base,base&dados=3`. Rolar; clicar `peao-amarelo-1` | `peao-amarelo-1` em `a2` (não passa por `c26`) |
| TC-LD-12 | Chegada só com número exato | Jogo 1: `?vermelho=v4,base,base,base&dados=3`; rolar. Jogo 2: mesmas posições com `dados=2`; rolar; clicar `peao-vermelho-1` | Jogo 1: `peao-vermelho-1` com `data-movel` = `false`, continua em `v4`; `mensagem` = "Sem jogada"; `vez` = "Amarelo". Jogo 2: `peao-vermelho-1` em `chegada`; `chegada-vermelho` = 1 |
| TC-LD-31 | Amarelo sai da base na casa dele | `?vez=amarelo&dados=6`. Rolar; clicar `peao-amarelo-1` | `peao-amarelo-1` em `c27`; `vez` = "Amarelo" (tirou 6) |
| TC-LD-32 | Com 6, pode mover um peão do percurso em vez de sair | `?vermelho=c10,base,base,base&dados=6`. Rolar; clicar `peao-vermelho-1` | Depois de rolar: os 4 vermelhos com `data-movel` = `true`. Depois do clique: `peao-vermelho-1` em `c16`; os outros 3 vermelhos na base; `vez` = "Vermelho" |

### Felipe — captura, casas seguras, vez e fim de jogo

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-LD-13 | Captura | `?vermelho=c5,base,base,base&amarelo=c8,base,base,base&dados=3`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` em `c8`; `peao-amarelo-1` volta para `base` |
| TC-LD-14 | Captura de dois peões | `?vermelho=c5,base,base,base&amarelo=c8,c8,base,base&dados=3`. Rolar; clicar `peao-vermelho-1` | `peao-amarelo-1` e `peao-amarelo-2` voltam para `base`; `peao-vermelho-1` em `c8` |
| TC-LD-15 | Estrela é segura | `?vermelho=c5,base,base,base&amarelo=c9,base,base,base&dados=4`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` e `peao-amarelo-1` os dois em `c9` |
| TC-LD-16 | Saída é segura | `?amarelo=c1,base,base,base&dados=6`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` em `c1`; `peao-amarelo-1` continua em `c1` |
| TC-LD-17 | Mesma cor divide a casa | `?vermelho=c1,c5,base,base&dados=4`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` e `peao-vermelho-2` os dois em `c5` |
| TC-LD-18 | Vez alterna sem 6 | `?vermelho=c1,base,base,base&dados=3`. Rolar; clicar `peao-vermelho-1` | `peao-vermelho-1` em `c4`; `vez` = "Amarelo"; `btn-rolar` habilitado |
| TC-LD-19 | Os dois sem jogada | `?dados=3,4`. Rolar (Vermelho); rolar (Amarelo) | Depois da 1ª: `vez` = "Amarelo". Depois da 2ª: `dado` = 4, `mensagem` = "Sem jogada", `vez` = "Vermelho"; os 8 peões continuam na base |
| TC-LD-20 | Seis sem jogada também passa | `?vermelho=v2,chegada,chegada,chegada&dados=6`. Rolar | Os 4 vermelhos com `data-movel` = `false` (v2 + 6 passa da chegada e não há peão na base); `mensagem` = "Sem jogada"; `vez` = "Amarelo" |
| TC-LD-21 | Vitória | `?vermelho=chegada,chegada,chegada,v5&dados=1`. Rolar; clicar `peao-vermelho-4` | `peao-vermelho-4` em `chegada`; `chegada-vermelho` = 4; `mensagem` = "Vermelho venceu!" |
| TC-LD-22 | Nada funciona após a vitória | Depois do TC-LD-21 | `btn-rolar` desabilitado; `mensagem` continua "Vermelho venceu!"; `vez` não muda ao clicar `btn-rolar` |
| TC-LD-23 | Nova partida | `?vermelho=c10,c20,base,base&amarelo=c30,base,base,base&dados=6`. Rolar; clicar `peao-vermelho-3`; clicar `btn-nova-partida` | Os 8 peões na base; `vez` = "Vermelho"; `dado` vazio; `chegada-vermelho` = 0; `mensagem` vazia; `btn-rolar` habilitado |
| TC-LD-24 | Peão na chegada não anda | `?vermelho=chegada,c10,base,base&dados=2`. Rolar; clicar `peao-vermelho-1`; clicar `peao-vermelho-2` | `peao-vermelho-1` com `data-movel` = `false` e continua em `chegada`; `peao-vermelho-2` com `data-movel` = `true` e vai para `c12` |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Henrique** cria o repositório e adiciona `FGaleti` como colaborador (Settings → Collaborators). **Felipe** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main` (fora o setup inicial, com o repositório vazio). Uma branch por tarefa: `henrique/a2-...`, `felipe/f2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm run verificar` sem problemas. O CI precisa estar verde no PR.
7. Ordem: **A1 entra primeiro** (estrutura do projeto). Depois disso as tarefas A e F andam em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm run verificar:completo` sem problemas: todos os TCs têm teste, e todos **falham pelo motivo certo**
- [ ] Nenhum código do jogo em `js/` (só o `js/main.js` vazio)
- [ ] README com: especificação, colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → resultado esperado)
- [ ] CI (GitHub Actions rodando `npm run verificar`) verde na `main`
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_ludo`

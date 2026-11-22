# desafio_teste_ludo

[![Testes](https://github.com/Henrique-ikeda/desafio_teste_ludo/actions/workflows/testes.yml/badge.svg)](https://github.com/Henrique-ikeda/desafio_teste_ludo/actions/workflows/testes.yml)

Desafio de testes: casos de teste para testar uma **partida de Ludo para 2 jogadores**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Especificação do desafio

Enunciado do professor ([desafios.md](https://github.com/JoaoChoma/teste_software_2026/blob/main/desafios.md), "Ludo"): *casos de teste para testar uma partida para 02 jogadores; casos de teste em JavaScript para testar JavaScript.* Repositório com o nome exigido: `desafio_teste_ludo`.

Regras do Ludo testadas:

- Dois jogadores, Vermelho e Amarelo, com 4 peões cada, começando na base.
- Percurso de 52 casas; cada cor dá uma volta e entra na sua reta final de 5 casas até a chegada.
- Dado de 1 a 6; peão só sai da base com 6; tirar 6 dá direito a jogar de novo.
- Cair numa casa com peão adversário manda esse peão de volta para a base, menos nas casas seguras (saídas e estrelas).
- Chegada só com o número exato; sem jogada possível, a vez passa sozinha.
- Vence quem levar os 4 peões à chegada; botão de nova partida.

Regras completas, contrato da tela e divisão das tarefas: [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Henrique Kendi Ikeda | 24039456-2 | [Henrique-ikeda](https://github.com/Henrique-ikeda) | Tarefas A1–A5: estrutura do projeto e casos de teste de início, dado, sair da base, mover, reta final e chegada (TC-LD-01 a 12 e 31 em diante) |
| Felipe Galeti Gôngora | 24036480-2 | [FGaleti](https://github.com/FGaleti) | Tarefas F1–F5: CI, README e casos de teste de captura, casas seguras, vez, vitória e nova partida (TC-LD-13 a 24, mais os extras da faixa reservada 25–30) |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits.

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-LD-NN"   # um caso só
```

## Funcionamento dos casos de teste

> **Aviso para a correção:** `npm test` termina com falhas **de propósito** (o jogo não é implementado; a entrega são os casos de teste). O comando que valida a entrega é `npm run verificar`, que sai com código 0 quando todos os testes falham pelo motivo certo.

**Situação:** somente os casos de teste. O jogo não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (`peao-vermelho-1` … `peao-amarelo-4`, `dado`, `vez`, `btn-rolar`, `chegada-vermelho`, `chegada-amarelo`, `mensagem`, `btn-nova-partida`). A posição de cada peão fica em `data-casa` (`base`, `c1`…`c52`, `v1`…`v5`, `a1`…`a5` ou `chegada`) e se ele pode andar com o dado atual, em `data-movel`.
- **Sem depender de sorte:** o dado é passado pelo parâmetro de URL `dados` (ex.: `6,3,5`) e as posições dos peões pelos parâmetros `vermelho`, `amarelo` e `vez`. Assim cada regra começa exatamente na situação dela (um peão a 4 casas de uma estrela, outro na reta final). As casas de cada movimento foram conferidas por script.
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-LD-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md. A [matriz de cobertura](docs/MATRIZ-COBERTURA.md) liga cada regra do jogo aos seus casos.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`. Uso de IA documentado em [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md).
- **Integração contínua:** o GitHub Actions ([`.github/workflows/testes.yml`](.github/workflows/testes.yml)) roda `npm ci` e `npm run verificar` em todo push e Pull Request, com Node 18, 20 e 22 no Ubuntu e no Windows, e publica como artefato o relatório JSON do Jest e a saída do verificador. O `npm run verificar:completo` roda à mão (*Run workflow*) ou em PR com o rótulo `entrega`.
- **Os testes estão certos?** Falhar pelo motivo certo não prova que o resultado esperado está correto. Por isso os testes foram rodados, fora do repositório, contra uma implementação de referência (todos passam) e contra versões com um defeito de cada vez (todas são pegas): [validação dos testes do Henrique](docs/VALIDACAO-TESTES-HENRIQUE.md).

## Casos de teste (33)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-LD-01 | Início da partida | `tests/dado-e-saida.spec.js` | Os 8 peões com `data-casa` = `base`; `vez` = "Vermelho"; `dado` vazio; `btn-rolar` habilitado; `chegada-vermelho` = 0 e `chegada-amarelo` = 0; `mensagem` vazia | Henrique |
| TC-LD-02 | Dado de 1 a 6 | `tests/dado-e-saida.spec.js` | Em todas, `dado` é um número inteiro de 1 a 6 | Henrique |
| TC-LD-03 | Sem 6 não sai da base | `tests/dado-e-saida.spec.js` | `dado` = 3; os 4 peões vermelhos com `data-movel` = `false` e na base; `mensagem` = "Sem jogada"; `vez` = "Amarelo" | Henrique |
| TC-LD-04 | Com 6 sai da base | `tests/dado-e-saida.spec.js` | Depois de rolar: os 4 vermelhos com `data-movel` = `true` e os amarelos com `false`. Depois do clique: `peao-vermelho-1` em `c1` | Henrique |
| TC-LD-05 | Tirou 6, joga de novo | `tests/dado-e-saida.spec.js` | Depois do 1º movimento: `vez` = "Vermelho" e `btn-rolar` habilitado. Depois do 2º: `peao-vermelho-1` em `c3`; `vez` = "Amarelo" | Henrique |
| TC-LD-06 | Andar o número do dado | `tests/movimento.spec.js` | `peao-vermelho-1` em `c5`; `vez` = "Amarelo" | Henrique |
| TC-LD-07 | Não rola duas vezes | `tests/dado-e-saida.spec.js` | Depois da 1ª rolagem `btn-rolar` fica desabilitado; `dado` continua 6; os peões continuam na base até um ser clicado | Henrique |
| TC-LD-08 | Só peão que pode andar se mexe | `tests/movimento.spec.js` | `peao-vermelho-2` com `data-movel` = `false` e continua na base; `peao-vermelho-1` com `data-movel` = `true` e continua em `c1`; `vez` continua "Vermelho" | Henrique |
| TC-LD-09 | Dar a volta no tabuleiro | `tests/movimento.spec.js` | `peao-amarelo-1` em `c3` | Henrique |
| TC-LD-10 | Vermelho entra na reta final | `tests/movimento.spec.js` | `peao-vermelho-1` em `v2` | Henrique |
| TC-LD-11 | Amarelo entra na reta final | `tests/movimento.spec.js` | `peao-amarelo-1` em `a2` (não passa por `c26`) | Henrique |
| TC-LD-12 | Chegada só com número exato | `tests/movimento.spec.js` | Jogo 1: `peao-vermelho-1` com `data-movel` = `false`, continua em `v4`; `mensagem` = "Sem jogada"; `vez` = "Amarelo". Jogo 2: `peao-vermelho-1` em `chegada`; `chegada-vermelho` = 1 | Henrique |
| TC-LD-31 | Amarelo sai da base na casa dele | `tests/dado-e-saida.spec.js` | `peao-amarelo-1` em `c27`; `vez` = "Amarelo" (tirou 6) | Henrique |
| TC-LD-32 | Com 6, pode mover um peão do percurso em vez de sair | `tests/dado-e-saida.spec.js` | Depois de rolar: os 4 vermelhos com `data-movel` = `true`. Depois do clique: `peao-vermelho-1` em `c16`; os outros 3 vermelhos na base; `vez` = "Vermelho" | Henrique |
| TC-LD-33 | Fronteiras do percurso | `tests/movimento.spec.js` | Vermelho `c51` + 1 → `v1`; `c50` + 6 → `v5`; `c51` + 6 → `chegada`; Amarelo `c25` + 1 → `a1`; `c52` + 1 → `c1` | Henrique |
| TC-LD-34 | Só o dono entra na própria reta final | `tests/movimento.spec.js` | `peao-vermelho-1` em `c27` (segue no percurso; não entra em `a1`…`a5`) | Henrique |
| TC-LD-35 | Chegada exata do Amarelo | `tests/movimento.spec.js` | Jogo 1: `peao-amarelo-1` com `data-movel` = `false`, continua em `a4`; `mensagem` = "Sem jogada"; `vez` = "Vermelho". Jogo 2: `peao-amarelo-1` em `chegada`; `chegada-amarelo` = 1 | Henrique |
| TC-LD-13 | Captura | `tests/captura.spec.js` | `peao-vermelho-1` em `c8`; `peao-amarelo-1` volta para `base` | Felipe |
| TC-LD-14 | Captura de dois peões | `tests/captura.spec.js` | `peao-amarelo-1` e `peao-amarelo-2` voltam para `base`; `peao-vermelho-1` em `c8` | Felipe |
| TC-LD-15 | Estrela é segura | `tests/captura.spec.js` | `peao-vermelho-1` e `peao-amarelo-1` os dois em `c9` | Felipe |
| TC-LD-16 | Saída é segura | `tests/captura.spec.js` | `peao-vermelho-1` em `c1`; `peao-amarelo-1` continua em `c1` | Felipe |
| TC-LD-17 | Mesma cor divide a casa | `tests/captura.spec.js` | `peao-vermelho-1` e `peao-vermelho-2` os dois em `c5` | Felipe |
| TC-LD-18 | Vez alterna sem 6 | `tests/vez.spec.js` | `peao-vermelho-1` em `c4`; `vez` = "Amarelo"; `btn-rolar` habilitado | Felipe |
| TC-LD-19 | Os dois sem jogada | `tests/vez.spec.js` | Depois da 1ª: `vez` = "Amarelo". Depois da 2ª: `dado` = 4, `mensagem` = "Sem jogada", `vez` = "Vermelho"; os 8 peões continuam na base | Felipe |
| TC-LD-20 | Seis sem jogada também passa | `tests/vez.spec.js` | Os 4 vermelhos com `data-movel` = `false` (v2 + 6 passa da chegada e não há peão na base); `mensagem` = "Sem jogada"; `vez` = "Amarelo" | Felipe |
| TC-LD-21 | Vitória | `tests/fim-de-jogo.spec.js` | `peao-vermelho-4` em `chegada`; `chegada-vermelho` = 4; `mensagem` = "Vermelho venceu!" | Felipe |
| TC-LD-22 | Nada funciona após a vitória | `tests/fim-de-jogo.spec.js` | `btn-rolar` desabilitado; `mensagem` continua "Vermelho venceu!"; `vez` não muda ao clicar `btn-rolar` | Felipe |
| TC-LD-23 | Nova partida | `tests/fim-de-jogo.spec.js` | Os 8 peões na base; `vez` = "Vermelho"; `dado` vazio; `chegada-vermelho` = 0; `mensagem` vazia; `btn-rolar` habilitado | Felipe |
| TC-LD-24 | Peão na chegada não anda | `tests/fim-de-jogo.spec.js` | `peao-vermelho-1` com `data-movel` = `false` e continua em `chegada`; `peao-vermelho-2` com `data-movel` = `true` e vai para `c12` | Felipe |
| TC-LD-25 | As 8 casas seguras | `tests/captura.spec.js` | Vermelho + 3 até `c9`, `c14`, `c22`, `c27`, `c35`, `c40`, `c48` e Amarelo + 3 até `c1`, cada casa com um peão adversário: os dois peões ficam na casa segura; nenhum volta para a base | Felipe |
| TC-LD-26 | Amarelo captura (e cruza `c52` → `c1`) | `tests/captura.spec.js` | `peao-amarelo-1` em `c3`; `peao-vermelho-1` volta para `base`; `vez` = "Vermelho" | Felipe |
| TC-LD-27 | Passar por cima não captura | `tests/captura.spec.js` | `peao-vermelho-1` em `c8`; `peao-amarelo-1` continua em `c6` (só captura quem termina na casa) | Felipe |
| TC-LD-30 | Amarelo sai da base na saída ocupada pelo Vermelho | `tests/captura.spec.js` | `peao-amarelo-1` e `peao-vermelho-1` os dois em `c27`; `vez` = "Amarelo" (tirou 6) | Felipe |

## Estrutura

```
index.html                    esqueleto da tela (elementos da seção 3)
js/main.js                    ponto de entrada do jogo (vazio)
tests/helpers.js              abrirJogo(), posições e dados fixos e atalhos
tests/*.spec.js               casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md               regras, contrato, tarefas e casos de teste
docs/                         matriz de cobertura e TDD com IA
```
